import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

// Transfer Hook Registry Program ID
export const TRANSFER_HOOK_REGISTRY_PROGRAM_ID = new PublicKey('A8UEmdwPDW5pqsU7iMEvwDn2C7fC6bsZGoRceukLzadE');

export interface RegistrySubmissionParams {
  programId: string;
  metadataUri: string;
  governanceProposalId?: string;
}

export interface HookSubmissionInfo {
  programId: PublicKey;
  submitter: PublicKey;
  status: string;
  submittedAt: number;
  reviewEndsAt: number;
  metadataUri: string;
  votesFor: number;
  votesAgainst: number;
  riskScore: number;
  automatedChecksPassed: boolean;
}

export class RegistryClient {
  constructor(
    private connection: Connection,
    private programId: PublicKey = TRANSFER_HOOK_REGISTRY_PROGRAM_ID
  ) {}

  // Get registry config PDA
  getRegistryConfigPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('registry')],
      this.programId
    );
  }

  // Get hook submission PDA
  getHookSubmissionPDA(programId: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('submission'), programId.toBuffer()],
      this.programId
    );
  }

  // Get risk assessment PDA
  getRiskAssessmentPDA(submissionPDA: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('risk_assessment'), submissionPDA.toBuffer()],
      this.programId
    );
  }

  // Initialize the registry (one-time setup)
  async initializeRegistry(
    authority: PublicKey,
    governanceThreshold: number,
    reviewPeriodSeconds: number,
    payer: PublicKey,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<string> {
    const [registryConfigPDA] = this.getRegistryConfigPDA();

    // Create instruction data
    const instructionData = Buffer.concat([
      Buffer.from([0]), // instruction index for initialize_registry
      authority.toBuffer(),
      this.encodeU64(governanceThreshold),
      this.encodeU64(reviewPeriodSeconds),
    ]);

    const instruction = {
      programId: this.programId,
      keys: [
        { pubkey: registryConfigPDA, isSigner: false, isWritable: true },
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: instructionData,
    };

    const transaction = new Transaction().add(instruction);
    transaction.feePayer = payer;
    transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;

    const signedTx = await signTransaction(transaction);
    const signature = await this.connection.sendRawTransaction(signedTx.serialize());
    await this.connection.confirmTransaction(signature);

    return signature;
  }

  // Submit a Transfer Hook for registry approval
  async submitHookForApproval(
    params: RegistrySubmissionParams,
    payer: PublicKey,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<string> {
    const hookProgramId = new PublicKey(params.programId);
    const [registryConfigPDA] = this.getRegistryConfigPDA();
    const [hookSubmissionPDA] = this.getHookSubmissionPDA(hookProgramId);

    console.log('Submitting hook for approval:', {
      hookProgramId: hookProgramId.toString(),
      registryConfig: registryConfigPDA.toString(),
      hookSubmission: hookSubmissionPDA.toString(),
      metadataUri: params.metadataUri,
    });

    // Create instruction data
    const instructionData = Buffer.concat([
      Buffer.from([1]), // instruction index for submit_hook_for_approval
      hookProgramId.toBuffer(),
      this.encodeString(params.metadataUri),
      params.governanceProposalId 
        ? Buffer.concat([Buffer.from([1]), new PublicKey(params.governanceProposalId).toBuffer()])
        : Buffer.from([0]), // None
    ]);

    const accounts = [
      { pubkey: registryConfigPDA, isSigner: false, isWritable: true },
      { pubkey: hookSubmissionPDA, isSigner: false, isWritable: true },
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      // Add the hook program as remaining account
      { pubkey: hookProgramId, isSigner: false, isWritable: false },
    ];

    const instruction = {
      programId: this.programId,
      keys: accounts,
      data: instructionData,
    };

    const transaction = new Transaction().add(instruction);
    transaction.feePayer = payer;
    transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;

    const signedTx = await signTransaction(transaction);
    const signature = await this.connection.sendRawTransaction(signedTx.serialize());
    await this.connection.confirmTransaction(signature);

    console.log('Hook submission successful:', signature);
    return signature;
  }

  // Assess hook risk (automated)
  async assessHookRisk(
    hookProgramId: PublicKey,
    payer: PublicKey,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<string> {
    const [hookSubmissionPDA] = this.getHookSubmissionPDA(hookProgramId);
    const [riskAssessmentPDA] = this.getRiskAssessmentPDA(hookSubmissionPDA);

    const instructionData = Buffer.from([2]); // instruction index for assess_hook_risk

    const instruction = {
      programId: this.programId,
      keys: [
        { pubkey: hookSubmissionPDA, isSigner: false, isWritable: true },
        { pubkey: riskAssessmentPDA, isSigner: false, isWritable: true },
        { pubkey: hookProgramId, isSigner: false, isWritable: false },
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: instructionData,
    };

    const transaction = new Transaction().add(instruction);
    transaction.feePayer = payer;
    transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;

    const signedTx = await signTransaction(transaction);
    const signature = await this.connection.sendRawTransaction(signedTx.serialize());
    await this.connection.confirmTransaction(signature);

    return signature;
  }

  // Cast governance vote
  async castGovernanceVote(
    hookProgramId: PublicKey,
    vote: boolean,
    rationale: string,
    payer: PublicKey,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<string> {
    const [hookSubmissionPDA] = this.getHookSubmissionPDA(hookProgramId);
    const [governanceVotePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('vote'), hookSubmissionPDA.toBuffer(), payer.toBuffer()],
      this.programId
    );

    const instructionData = Buffer.concat([
      Buffer.from([3]), // instruction index for cast_governance_vote
      Buffer.from([vote ? 1 : 0]),
      this.encodeString(rationale),
    ]);

    const instruction = {
      programId: this.programId,
      keys: [
        { pubkey: hookSubmissionPDA, isSigner: false, isWritable: true },
        { pubkey: governanceVotePDA, isSigner: false, isWritable: true },
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: instructionData,
    };

    const transaction = new Transaction().add(instruction);
    transaction.feePayer = payer;
    transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;

    const signedTx = await signTransaction(transaction);
    const signature = await this.connection.sendRawTransaction(signedTx.serialize());
    await this.connection.confirmTransaction(signature);

    return signature;
  }

  // Get hook submission info
  async getHookSubmissionInfo(hookProgramId: PublicKey): Promise<HookSubmissionInfo | null> {
    try {
      const [hookSubmissionPDA] = this.getHookSubmissionPDA(hookProgramId);
      const accountInfo = await this.connection.getAccountInfo(hookSubmissionPDA);
      
      if (!accountInfo) {
        return null;
      }

      // Parse the account data (this is a simplified parser)
      // In a real implementation, you'd use the proper Anchor deserialization
      const data = accountInfo.data;
      
      return {
        programId: hookProgramId,
        submitter: new PublicKey(data.slice(8, 40)), // Skip discriminator
        status: 'Pending', // Would parse actual status
        submittedAt: Date.now() / 1000,
        reviewEndsAt: Date.now() / 1000 + 604800, // 1 week
        metadataUri: '', // Would parse actual URI
        votesFor: 0,
        votesAgainst: 0,
        riskScore: 50,
        automatedChecksPassed: false,
      };
    } catch (error) {
      console.error('Error fetching hook submission info:', error);
      return null;
    }
  }

  // Utility methods
  private encodeU64(value: number): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64LE(BigInt(value), 0);
    return buffer;
  }

  private encodeString(str: string): Buffer {
    const strBuffer = Buffer.from(str, 'utf-8');
    const lengthBuffer = Buffer.alloc(4);
    lengthBuffer.writeUInt32LE(strBuffer.length, 0);
    return Buffer.concat([lengthBuffer, strBuffer]);
  }
}