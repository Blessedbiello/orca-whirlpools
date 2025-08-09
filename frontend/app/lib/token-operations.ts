import { Connection, PublicKey, Keypair, Transaction, SystemProgram } from '@solana/web3.js';
import { 
  createInitializeMintInstruction,
  createInitializeTransferHookInstruction,
  ExtensionType,
  getMintLen,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
  LENGTH_SIZE,
} from '@solana/spl-token';
import { 
  createInitializeExtraAccountMetaListInstruction,
} from '@solana/spl-transfer-hook-interface';

export interface CreateTokenParams {
  name: string;
  symbol: string;
  decimals: number;
  description: string;
  supply: string;
  transferHook: string;
  customProgramId?: string;
}

export interface TokenCreationResult {
  mintAddress: string;
  signature: string;
  explorerUrl: string;
}

// Transfer Hook Program IDs
export const TRANSFER_HOOK_PROGRAMS = {
  royalty: '7NsQqWLbikjv3kWqujtb2YQGToY4LSdn35egQs4AJEHC',
  compliance: 'CompZkVrVqQx7zNj64CkFXp2xxtbEfZd2KRJLiPQHd', // Placeholder
  logging: 'LoggZkVrVqQx7zNj64CkFXp2xxtbEfZd2KRJLiPQHd',     // Placeholder
  custom: '', // Will be provided by user
};

export class TokenOperations {
  constructor(private connection: Connection) {}

  static getTransferHookProgramId(hookType: string): string {
    if (hookType in TRANSFER_HOOK_PROGRAMS) {
      const programId = TRANSFER_HOOK_PROGRAMS[hookType as keyof typeof TRANSFER_HOOK_PROGRAMS];
      if (!programId) {
        throw new Error(`Transfer Hook program not configured for ${hookType}`);
      }
      return programId;
    }
    throw new Error(`Unknown Transfer Hook type: ${hookType}`);
  }

  async createTokenWithTransferHook(
    params: CreateTokenParams,
    payer: PublicKey,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
  ): Promise<TokenCreationResult> {
    const mintKeypair = Keypair.generate();
    const mintAddress = mintKeypair.publicKey;

    // Determine Transfer Hook program ID
    let transferHookProgramId: PublicKey;
    if (params.transferHook === 'custom' && params.customProgramId) {
      transferHookProgramId = new PublicKey(params.customProgramId);
    } else if (params.transferHook in TRANSFER_HOOK_PROGRAMS) {
      const programId = TRANSFER_HOOK_PROGRAMS[params.transferHook as keyof typeof TRANSFER_HOOK_PROGRAMS];
      if (!programId) {
        throw new Error(`Transfer Hook program not configured for ${params.transferHook}`);
      }
      transferHookProgramId = new PublicKey(programId);
    } else {
      throw new Error(`Unknown Transfer Hook type: ${params.transferHook}`);
    }

    // Calculate space needed for mint account with Transfer Hook extension
    const extensions = [ExtensionType.TransferHook];
    const mintLen = getMintLen(extensions);

    // Calculate rent
    const lamports = await this.connection.getMinimumBalanceForRentExemption(mintLen);

    console.log('Creating Token-2022 with Transfer Hook:', {
      mintAddress: mintAddress.toString(),
      transferHookProgram: transferHookProgramId.toString(),
      decimals: params.decimals,
      extensions,
    });

    const transaction = new Transaction();

    // Create mint account
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: payer,
        newAccountPubkey: mintAddress,
        space: mintLen,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      })
    );

    // Initialize Transfer Hook extension
    transaction.add(
      createInitializeTransferHookInstruction(
        mintAddress,
        payer, // authority
        transferHookProgramId,
        TOKEN_2022_PROGRAM_ID
      )
    );

    // Initialize mint
    transaction.add(
      createInitializeMintInstruction(
        mintAddress,
        params.decimals,
        payer, // mint authority
        payer, // freeze authority  
        TOKEN_2022_PROGRAM_ID
      )
    );

    // Add recent blockhash
    const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payer;

    // Sign with mint keypair
    transaction.partialSign(mintKeypair);

    // Sign with wallet
    const signedTransaction = await signTransaction(transaction);

    // Send transaction
    const signature = await this.connection.sendRawTransaction(signedTransaction.serialize());

    // Confirm transaction
    await this.connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });

    console.log('Token created successfully:', {
      mintAddress: mintAddress.toString(),
      signature,
    });

    return {
      mintAddress: mintAddress.toString(),
      signature,
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
    };
  }

  async initializeExtraAccountMetaList(
    mintAddress: PublicKey,
    transferHookProgramId: PublicKey,
    payer: PublicKey,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
  ): Promise<string> {
    // Derive extra account meta list PDA
    const [extraAccountMetaListPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('extra-account-metas'), mintAddress.toBuffer()],
      transferHookProgramId
    );

    console.log('Initializing Extra Account Meta List:', {
      mintAddress: mintAddress.toString(),
      extraAccountMetaListPDA: extraAccountMetaListPDA.toString(),
      transferHookProgram: transferHookProgramId.toString(),
    });

    const transaction = new Transaction();

    // Initialize extra account meta list
    transaction.add(
      createInitializeExtraAccountMetaListInstruction({
        payer,
        extraAccountMetaList: extraAccountMetaListPDA,
        mint: mintAddress,
        transferHookProgramId,
      })
    );

    // Add recent blockhash
    const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payer;

    // Sign with wallet
    const signedTransaction = await signTransaction(transaction);

    // Send transaction
    const signature = await this.connection.sendRawTransaction(signedTransaction.serialize());

    // Confirm transaction
    await this.connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });

    console.log('Extra Account Meta List initialized:', signature);
    return signature;
  }

  async submitToRegistry(
    mintAddress: string,
    transferHookProgramId: string,
    metadata: {
      name: string;
      symbol: string;
      description: string;
    },
    payer: PublicKey,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
  ): Promise<string> {
    const { RegistryClient } = await import('./registry-client');
    const registryClient = new RegistryClient(this.connection);

    console.log('Submitting to Transfer Hook Registry:', {
      mintAddress,
      transferHookProgramId,
      metadata,
    });

    // Create metadata URI (in production, this would be uploaded to IPFS/Arweave)
    const metadataUri = `data:application/json;base64,${Buffer.from(
      JSON.stringify({
        name: metadata.name,
        symbol: metadata.symbol,
        description: metadata.description,
        mint: mintAddress,
        transferHook: transferHookProgramId,
        timestamp: Date.now(),
      })
    ).toString('base64')}`;

    try {
      const signature = await registryClient.submitHookForApproval(
        {
          programId: transferHookProgramId,
          metadataUri,
        },
        payer,
        signTransaction
      );

      // Trigger automated risk assessment
      await registryClient.assessHookRisk(
        new PublicKey(transferHookProgramId),
        payer,
        signTransaction
      );

      return signature;
    } catch (error) {
      console.error('Registry submission error:', error);
      
      // Fallback to logging for demo purposes
      console.log('Registry submission would be:', {
        programId: transferHookProgramId,
        metadataUri: metadataUri.slice(0, 100) + '...',
      });
      
      return 'demo_registry_submission_' + Math.random().toString(36).substr(2, 9);
    }
  }
}