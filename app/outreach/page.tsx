'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Search, Copy, ExternalLink, MessageSquare, Mail, Users, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Contact {
  id: string
  name: string
  title: string
  company: string
  linkedinUrl: string
  email?: string
  department: string
  connectionLevel: '1st' | '2nd' | '3rd' | 'out-of-network'
}

interface OutreachTemplate {
  id: string
  name: string
  subject: string
  message: string
  type: 'linkedin' | 'email'
  useCase: string
}

export default function OutreachPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [templates, setTemplates] = useState<OutreachTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadTemplates()
    loadMockContacts()
  }, [])

  const loadTemplates = () => {
    const mockTemplates: OutreachTemplate[] = [
      {
        id: '1',
        name: 'New Grad Introduction',
        subject: 'CS Student Interested in [Company] Opportunities',
        message: `Hi [Name],

I hope this message finds you well! I'm Renato, a Computer Science student at Rose-Hulman Institute of Technology, graduating in May 2026. I came across [Company] and was impressed by your team's innovative work in [specific area].

I have experience in full-stack development, AI/ML, and have built several projects including an AI-powered fitness application. I'm particularly interested in roles involving [mention relevant tech stack or domain].

Would you be open to a brief conversation about opportunities at [Company] for new graduates? I'd love to learn more about the team and how I could contribute.

Best regards,
Renato Dap
Computer Science, Rose-Hulman Institute of Technology
renatodapapplications@gmail.com`,
        type: 'linkedin',
        useCase: 'First connection with hiring managers or engineers'
      },
      {
        id: '2',
        name: 'Application Follow-up',
        subject: 'Following up on Software Engineer Application',
        message: `Hi [Name],

I recently applied for the [Job Title] position at [Company] and wanted to reach out directly to express my continued interest in the role.

As a CS student with hands-on experience in [relevant technologies], I'm excited about the opportunity to contribute to [specific company project or value]. My background in [relevant experience] aligns well with the requirements I saw in the job posting.

Would you be available for a brief call to discuss the role and my background? I'm happy to work around your schedule.

Thank you for your time and consideration.

Best regards,
Renato Dap
(812) 262-8002
renatodapapplications@gmail.com`,
        type: 'email',
        useCase: 'Following up after submitting application'
      },
      {
        id: '3',
        name: 'Referral Request',
        subject: 'Rose-Hulman Student Seeking Referral',
        message: `Hi [Name],

I noticed we both have connections to [Company/mutual connection] and wanted to reach out about a potential referral opportunity.

I'm a Computer Science student at Rose-Hulman graduating in May 2026, and I'm very interested in the [Job Title] position at [Company]. My experience in [relevant skills] and passion for [relevant area] make me excited about contributing to your team.

Would you be willing to provide a referral or connect me with the hiring team? I'd be happy to send over my resume and answer any questions about my background.

Thanks so much for considering!

Best,
Renato`,
        type: 'linkedin',
        useCase: 'Asking for referrals from alumni or network connections'
      }
    ]
    setTemplates(mockTemplates)
  }

  const loadMockContacts = () => {
    // In real implementation, this would integrate with LinkedIn Sales Navigator or similar
    const mockContacts: Contact[] = [
      {
        id: '1',
        name: 'Sarah Chen',
        title: 'Senior Software Engineer',
        company: 'TikTok',
        linkedinUrl: 'https://linkedin.com/in/sarahchen',
        email: 'sarah.chen@tiktok.com',
        department: 'Engineering',
        connectionLevel: '2nd'
      },
      {
        id: '2',
        name: 'Mike Rodriguez',
        title: 'Engineering Manager',
        company: 'Whatnot',
        linkedinUrl: 'https://linkedin.com/in/mikerodriguez',
        department: 'Engineering',
        connectionLevel: '3rd'
      },
      {
        id: '3',
        name: 'Jennifer Wu',
        title: 'Technical Recruiter',
        company: 'TikTok',
        linkedinUrl: 'https://linkedin.com/in/jenniferwu',
        email: 'jennifer.wu@tiktok.com',
        department: 'Recruiting',
        connectionLevel: '1st'
      }
    ]
    setContacts(mockContacts)
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(label)
      setTimeout(() => setCopiedText(null), 2000)
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  const personalizeMessage = (template: OutreachTemplate, contact: Contact) => {
    return template.message
      .replace(/\[Name\]/g, contact.name.split(' ')[0])
      .replace(/\[Company\]/g, contact.company)
      .replace(/\[Job Title\]/g, 'Software Engineer') // Would be dynamic in real app
  }

  const getConnectionColor = (level: string) => {
    switch (level) {
      case '1st':
        return 'text-green-600 bg-green-50 border-green-200'
      case '2nd':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case '3rd':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const filteredContacts = contacts.filter(contact =>
    (searchTerm === '' || 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.title.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedCompany === '' || contact.company === selectedCompany)
  )

  const companies = Array.from(new Set(contacts.map(c => c.company)))

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline"
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Outreach Center</h1>
          <p className="text-gray-600">Connect with hiring managers and industry professionals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Search */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Find Contacts
            </h2>
            
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name, title, or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="">All Companies</option>
                {companies.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-600 mb-4">
              Found {filteredContacts.length} contacts
            </div>
          </div>

          {/* Contacts List */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="divide-y max-h-96 overflow-y-auto">
              {filteredContacts.map((contact) => (
                <div key={contact.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getConnectionColor(contact.connectionLevel)}`}>
                          {contact.connectionLevel}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 text-sm mb-1">{contact.title}</p>
                      <p className="text-gray-600 text-sm flex items-center gap-1 mb-2">
                        <Building className="w-4 h-4" />
                        {contact.company} • {contact.department}
                      </p>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => window.open(contact.linkedinUrl, '_blank')}
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          LinkedIn
                        </Button>
                        {contact.email && (
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`mailto:${contact.email}`, '_blank')}
                            className="flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3" />
                            Email
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Message Templates */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Message Templates
            </h2>
            
            <div className="space-y-4">
              {templates.map((template) => (
                <div 
                  key={template.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedTemplate === template.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      template.type === 'linkedin' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {template.type}
                    </span>
                    <h3 className="font-semibold text-sm">{template.name}</h3>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2">{template.useCase}</p>
                  
                  {selectedTemplate === template.id && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Subject:</span>
                        <Button
                          onClick={() => copyToClipboard(template.subject, `subject-${template.id}`)}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1 text-xs"
                        >
                          <Copy className="w-3 h-3" />
                          {copiedText === `subject-${template.id}` ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{template.subject}</p>
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Message:</span>
                        <Button
                          onClick={() => copyToClipboard(template.message, `message-${template.id}`)}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1 text-xs"
                        >
                          <Copy className="w-3 h-3" />
                          {copiedText === `message-${template.id}` ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                      <div className="bg-gray-50 rounded p-3 text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                        {template.message}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-6 bg-green-50 rounded-lg p-6">
        <h3 className="font-semibold text-green-900 mb-3">Outreach Best Practices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-800 text-sm">
          <div>
            <h4 className="font-medium mb-2">LinkedIn Messages</h4>
            <ul className="space-y-1">
              <li>• Keep initial messages under 200 characters</li>
              <li>• Personalize with specific company/role details</li>
              <li>• Connect first, then send message</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Email Outreach</h4>
            <ul className="space-y-1">
              <li>• Use clear, specific subject lines</li>
              <li>• Include your resume and portfolio link</li>
              <li>• Follow up after 5-7 business days</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}