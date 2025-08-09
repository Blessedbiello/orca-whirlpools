'use client'

import { useState } from 'react'
import { useWallet } from './WalletProvider'
import { 
  Search, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Eye,
  ExternalLink,
  Filter
} from 'lucide-react'
import toast from 'react-hot-toast'

interface HookSubmission {
  id: string
  programId: string
  name: string
  submitter: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'suspended'
  riskScore: number
  votesFor: number
  votesAgainst: number
  submittedAt: string
  reviewEndsAt: string
  description: string
  features: string[]
  metadataUri?: string
}

const MOCK_SUBMISSIONS: HookSubmission[] = [
  {
    id: '1',
    programId: 'ROYALTY123abc456def789ghi012jkl345mno678pqr',
    name: 'NFT Royalty Hook',
    submitter: '5Gv8...xyz9',
    status: 'approved',
    riskScore: 25,
    votesFor: 45,
    votesAgainst: 3,
    submittedAt: '2024-01-15T10:00:00Z',
    reviewEndsAt: '2024-01-22T10:00:00Z',
    description: 'Automatically collects royalties on NFT and token transfers',
    features: ['Creator royalties', 'Marketplace support', 'Configurable rates'],
  },
  {
    id: '2',
    programId: 'COMPLIANCE456def789ghi012jkl345mno678pqr890st',
    name: 'KYC Compliance Hook',
    submitter: '7Hj2...abc1',
    status: 'under_review',
    riskScore: 45,
    votesFor: 12,
    votesAgainst: 8,
    submittedAt: '2024-01-20T14:30:00Z',
    reviewEndsAt: '2024-01-27T14:30:00Z',
    description: 'Validates KYC status and geographic restrictions',
    features: ['KYC validation', 'Geographic restrictions', 'Compliance reporting'],
  },
  {
    id: '3',
    programId: 'LOGGING789ghi012jkl345mno678pqr890stuv123',
    name: 'Transfer Logging Hook',
    submitter: '9Kx4...def5',
    status: 'approved',
    riskScore: 15,
    votesFor: 67,
    votesAgainst: 2,
    submittedAt: '2024-01-10T09:15:00Z',
    reviewEndsAt: '2024-01-17T09:15:00Z',
    description: 'Logs all transfer events for analytics and audit purposes',
    features: ['Event logging', 'Analytics tracking', 'Audit trails'],
  },
  {
    id: '4',
    programId: 'MALICIOUS012jkl345mno678pqr890stuv123wxyz456',
    name: 'Suspicious Hook',
    submitter: '3Bz7...hij8',
    status: 'rejected',
    riskScore: 85,
    votesFor: 2,
    votesAgainst: 23,
    submittedAt: '2024-01-18T16:45:00Z',
    reviewEndsAt: '2024-01-25T16:45:00Z',
    description: 'Hook with unclear purpose and high risk indicators',
    features: ['Unknown functionality', 'Obfuscated code'],
  },
]

const STATUS_STYLES = {
  pending: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock },
  under_review: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Eye },
  approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
  rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
  suspended: { bg: 'bg-orange-100', text: 'text-orange-800', icon: AlertTriangle },
}

export function RegistryDashboard() {
  const { wallet } = useWallet()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isVoting, setIsVoting] = useState<string | null>(null)

  const filteredSubmissions = MOCK_SUBMISSIONS.filter(submission => {
    const matchesSearch = 
      submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.programId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleVote = async (submissionId: string, vote: boolean) => {
    if (!wallet?.connected) {
      toast.error('Please connect your wallet first')
      return
    }

    setIsVoting(submissionId)

    try {
      toast.loading(`Casting ${vote ? 'approval' : 'rejection'} vote...`, { id: 'vote' })

      // In a real implementation, this would:
      // 1. Create vote transaction
      // 2. Submit to Transfer Hook Registry
      // 3. Update submission vote counts

      await new Promise(resolve => setTimeout(resolve, 2000))

      toast.success(
        `Vote cast successfully! You voted to ${vote ? 'approve' : 'reject'} this hook.`,
        { id: 'vote', duration: 4000 }
      )

    } catch (error) {
      toast.error('Failed to cast vote', { id: 'vote' })
      console.error('Voting error:', error)
    } finally {
      setIsVoting(null)
    }
  }

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'text-green-600'
    if (score <= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRiskLabel = (score: number) => {
    if (score <= 30) return 'Low Risk'
    if (score <= 60) return 'Medium Risk'
    return 'High Risk'
  }

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            {MOCK_SUBMISSIONS.length}
          </div>
          <div className="text-sm text-gray-600">Total Submissions</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {MOCK_SUBMISSIONS.filter(s => s.status === 'approved').length}
          </div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">
            {MOCK_SUBMISSIONS.filter(s => s.status === 'under_review').length}
          </div>
          <div className="text-sm text-gray-600">Under Review</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-red-600">
            {MOCK_SUBMISSIONS.filter(s => s.status === 'rejected').length}
          </div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search hooks by name, program ID, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field pl-10 min-w-40"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">No submissions found</div>
            <div className="text-sm text-gray-500">Try adjusting your search or filters</div>
          </div>
        ) : (
          filteredSubmissions.map((submission) => {
            const statusStyle = STATUS_STYLES[submission.status]
            const StatusIcon = statusStyle.icon
            const isUnderReview = submission.status === 'under_review'

            return (
              <div
                key={submission.id}
                className="bg-white rounded-lg border border-gray-200 p-6 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {submission.name}
                      </h3>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {submission.status.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                    
                    <p className="text-gray-600">{submission.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Program ID: {submission.programId.slice(0, 8)}...{submission.programId.slice(-4)}</span>
                      <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                      <span>Submitter: {submission.submitter}</span>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <div className={`text-sm font-medium ${getRiskColor(submission.riskScore)}`}>
                      Risk Score: {submission.riskScore}/100
                    </div>
                    <div className="text-xs text-gray-500">
                      {getRiskLabel(submission.riskScore)}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {submission.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Voting Section (only for under review) */}
                {isUnderReview && (
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-green-600">{submission.votesFor}</span> for,{' '}
                          <span className="font-medium text-red-600">{submission.votesAgainst}</span> against
                        </div>
                        <div className="text-xs text-gray-500">
                          Review ends: {new Date(submission.reviewEndsAt).toLocaleDateString()}
                        </div>
                      </div>

                      {wallet?.connected && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleVote(submission.id, true)}
                            disabled={isVoting === submission.id}
                            className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span className="text-xs font-medium">Approve</span>
                          </button>
                          
                          <button
                            onClick={() => handleVote(submission.id, false)}
                            disabled={isVoting === submission.id}
                            className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                          >
                            <ThumbsDown className="w-3 h-3" />
                            <span className="text-xs font-medium">Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {submission.metadataUri && (
                      <a
                        href={submission.metadataUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Documentation</span>
                      </a>
                    )}
                    
                    <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-700">
                      <Eye className="w-3 h-3" />
                      <span>View Details</span>
                    </button>
                  </div>

                  {submission.status === 'approved' && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <Shield className="w-4 h-4" />
                      <span>Ready for TokenBadge creation</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Submit New Hook CTA */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Have a Transfer Hook to Submit?
        </h3>
        <p className="text-gray-600 mb-4">
          Submit your Transfer Hook program for community review and approval.
          Get it added to the registry to enable TokenBadge creation.
        </p>
        <button className="btn-primary">
          Submit Transfer Hook
        </button>
      </div>
    </div>
  )
}