import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  ChevronRight,
  Home,
  Zap,
  Users,
  CreditCard,
  Settings,
  Shield,
  Code,
  HelpCircle,
  Star,
  Compass,
  BarChart3,
  MessageCircle,
  FileText,
  GitCompare,
  Folder,
  Bell,
  ArrowRight
} from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  icon: any;
  description: string;
  articles: DocArticle[];
}

interface DocArticle {
  id: string;
  title: string;
  content: string;
}

export default function Documentation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  const sections: DocSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Home,
      description: 'Learn the basics of AI Universe',
      articles: [
        {
          id: 'introduction',
          title: 'Introduction to AI Universe',
          content: `Welcome to AI Universe, your comprehensive platform for discovering and exploring AI tools!

AI Universe is designed to help you navigate the rapidly evolving world of artificial intelligence. Whether you're a developer, content creator, business owner, or AI enthusiast, our platform provides you with:

• Curated Directory: Access thousands of AI tools across various categories
• Advanced Search: Find the perfect tool using our powerful search and filtering system
• Detailed Reviews: Read authentic user reviews and ratings
• Comparison Tools: Compare multiple AI tools side-by-side
• Personal Collections: Organize your favorite tools into custom collections
• Latest News: Stay updated with the latest AI developments and trends

Getting started is easy:
1. Create a free account to unlock more features
2. Explore our tool directory using search or categories
3. Save your favorite tools for quick access
4. Create collections to organize tools by project or use case
5. Upgrade to premium plans for advanced features like analytics and AI recommendations`
        },
        {
          id: 'account-setup',
          title: 'Setting Up Your Account',
          content: `Creating and configuring your AI Universe account is quick and simple:

Registration:
1. Click "Sign Up" in the top navigation
2. Enter your email address and choose a secure password
3. Verify your email address (check your inbox)
4. Complete your profile with additional information

Profile Customization:
• Add a profile picture to personalize your account
• Set your display name and bio
• Choose your interests and preferred AI categories
• Configure notification preferences
• Set your timezone for accurate activity tracking

Account Settings:
Navigate to Settings to manage:
• Personal Information: Update your email, name, and profile details
• Password & Security: Change your password and enable two-factor authentication
• Notification Preferences: Control what emails and alerts you receive
• Privacy Settings: Manage your data and visibility preferences
• Subscription: View and manage your plan details

Best Practices:
• Use a strong, unique password
• Keep your email address up to date
• Review privacy settings regularly
• Enable notifications for important updates`
        },
        {
          id: 'navigation',
          title: 'Navigating the Platform',
          content: `AI Universe is designed for intuitive navigation with easy access to all features:

Main Navigation:
• Home: Your personalized dashboard with recommendations
• Explore: Browse the complete tool directory with filters
• Top Tools: See the most popular and highly-rated AI tools
• Compare: Compare multiple tools side-by-side
• News: Access the latest AI industry news (Plus/Pro plans)
• Collections: Manage your custom tool collections
• Favorites: Quick access to your saved tools
• Analytics: View your usage insights (Pro plan)

Search Functionality:
Use the search bar to find tools by:
• Tool name or description
• Category or use case
• Features and capabilities
• Pricing model
• Technology stack

Quick Actions:
• Click the star icon to favorite any tool
• Use the compare checkbox to add tools to comparison
• Access tool details by clicking on any tool card
• Navigate back using the browser back button or breadcrumbs`
        }
      ]
    },
    {
      id: 'features',
      title: 'Core Features',
      icon: Zap,
      description: 'Explore all platform capabilities',
      articles: [
        {
          id: 'browsing-tools',
          title: 'Browsing and Discovering Tools',
          content: `Find the perfect AI tool for your needs using our powerful discovery features:

Browse by Category:
• AI Assistants & Chatbots
• Image Generation & Editing
• Video Creation & Editing
• Audio & Music Generation
• Writing & Content Creation
• Code & Development
• Data Analysis & Visualization
• Business & Productivity
• Marketing & SEO
• And many more...

Advanced Filtering:
Narrow down results using multiple filters:
• Pricing: Free, Freemium, Paid, Enterprise
• Features: Specific capabilities you need
• Rating: Filter by user ratings
• Popularity: Most viewed or most favorited
• Release Date: Find the newest tools

Tool Details:
Each tool listing includes:
• Comprehensive description and use cases
• Key features and capabilities
• Pricing information and plans
• Screenshots and demos
• User reviews and ratings
• Similar tool recommendations
• Official website link
• Documentation and support resources

Smart Recommendations:
Pro members receive AI-powered recommendations based on:
• Your browsing history
• Favorite tools and categories
• Similar user preferences
• Trending tools in your interests`
        },
        {
          id: 'favorites',
          title: 'Managing Favorites',
          content: `Keep track of your preferred AI tools with the favorites system:

Adding Favorites:
• Click the star icon on any tool card
• Star count is displayed on each tool
• Your favorites are instantly synced across devices
• Free plan: Save up to 3 favorites
• Plus/Pro plans: Unlimited favorites

Viewing Favorites:
Access your favorites page to see all saved tools:
• Grid or list view options
• Sort by date added or alphabetically
• Quick access to tool details
• Bulk actions for organization

Organizing Favorites:
• Create collections to group related tools
• Tag favorites with custom labels
• Export your favorites list
• Share favorite collections with others

Favorites Analytics (Pro):
Track insights about your favorites:
• Most accessed favorites
• Categories you favor most
• Time spent on favorite tools
• Usage patterns and trends`
        },
        {
          id: 'collections',
          title: 'Creating Collections',
          content: `Organize AI tools into custom collections for easy access and sharing:

Creating Collections:
1. Navigate to the Collections page
2. Click "Create New Collection"
3. Enter a name and description
4. Choose a visibility setting (private/public)
5. Add tools to your collection

Managing Collections:
• Edit collection details anytime
• Add or remove tools easily
• Reorder tools within collections
• Delete collections you no longer need
• Duplicate collections for similar projects

Collection Types:
Create collections for different purposes:
• Project-specific tool sets
• Category-based groupings
• Learning and research collections
• Client or team recommendations
• Personal tool stacks

Sharing Collections:
• Generate shareable links
• Collaborate with team members (Pro)
• Make collections public for community
• Embed collections on your website
• Export as PDF or spreadsheet

Collection Analytics (Pro):
• View collection engagement metrics
• See which tools are most accessed
• Track collection growth over time
• Analyze user interactions`
        },
        {
          id: 'comparing-tools',
          title: 'Comparing AI Tools',
          content: `Make informed decisions by comparing multiple AI tools side-by-side:

Basic Comparison:
1. Select tools you want to compare (checkbox on tool cards)
2. Click "Compare" button in the header
3. View tools side-by-side with key information
4. Compare pricing, features, and ratings
5. Access each tool's detail page from comparison

Advanced Comparison (Pro):
AI-powered comparison includes:
• Detailed feature breakdown
• Pricing analysis and recommendations
• Use case matching
• Pros and cons for each tool
• Best fit recommendations based on your needs
• Performance metrics and benchmarks

Comparison Categories:
• Features and capabilities
• Pricing and value
• User interface and experience
• Integration options
• Support and documentation
• Performance and reliability
• Security and privacy
• Scalability options

Saving Comparisons:
• Save comparison results for later reference
• Export comparisons as PDF
• Share comparison links with colleagues
• Track how tools evolve over time

Best Practices:
• Compare tools with similar use cases
• Consider both features and pricing
• Read user reviews on compared tools
• Test free trials when available
• Factor in learning curve and support`
        },
        {
          id: 'reviews',
          title: 'Writing and Reading Reviews',
          content: `Share your experiences and learn from the community through reviews:

Reading Reviews:
• View all reviews on tool detail pages
• Sort by most recent, helpful, or rating
• Filter by rating (1-5 stars)
• See verified user badges
• Read detailed pros and cons

Writing Reviews (Plus/Pro):
Requirements:
• Active Plus or Pro subscription
• Account must be verified
• Must have tried the tool

Review Guidelines:
• Be honest and constructive
• Provide specific examples
• Include both positives and negatives
• Rate on a 5-star scale
• Add relevant tags or categories

Review Structure:
1. Overall rating (1-5 stars)
2. Title: Brief summary of your experience
3. Pros: What you liked about the tool
4. Cons: Areas for improvement
5. Detailed review: Your comprehensive thoughts
6. Use case: How you used the tool
7. Recommendation: Would you recommend it?

Review Moderation:
All reviews are moderated to ensure quality:
• Spam and fake reviews are removed
• Offensive content is not tolerated
• Reviews must be relevant and helpful
• Users can report inappropriate reviews

Helpful Reviews:
Other users can mark reviews as helpful:
• Most helpful reviews appear first
• Build reputation as a trusted reviewer
• Contribute to the community
• Help others make better decisions`
        }
      ]
    },
    {
      id: 'plans',
      title: 'Plans & Pricing',
      icon: CreditCard,
      description: 'Understanding subscription options',
      articles: [
        {
          id: 'plan-comparison',
          title: 'Plan Comparison',
          content: `Choose the perfect plan for your needs:

Explorer (Free):
Perfect for casual users:
• Access to 100+ AI tools
• Save up to 3 favorites
• Basic search and filtering
• Community forum access
• Email support

Creator ($9.99/month):
For active users and creators:
• Unlimited AI tools access
• Unlimited favorites
• Write and publish reviews
• Tool comparison features
• Submit new tools
• Priority news access
• Advanced search filters
• Email support with faster response

Universe Master ($19.99/month):
For professionals and power users:
• Everything in Creator plan
• Personal analytics dashboard
• AI-powered recommendations
• Advanced comparison tools
• Priority support (24/7)
• Early access to new features
• API access (coming soon)
• Custom integrations
• Team collaboration features
• Usage insights and reports

All Plans Include:
• Regular platform updates
• Security and privacy protection
• Mobile-responsive design
• Cross-device synchronization
• Community access
• Regular AI tool database updates

Annual Plans:
Save 20% with annual billing:
• Creator: $95.90/year (save $23.90)
• Universe Master: $191.90/year (save $47.90)`
        },
        {
          id: 'upgrading',
          title: 'Upgrading Your Plan',
          content: `Upgrade your account to unlock more features:

How to Upgrade:
1. Navigate to the Pricing page
2. Choose your preferred plan
3. Click "Upgrade Now"
4. Complete secure checkout process
5. Access new features immediately

Payment Methods:
We accept:
• All major credit cards (Visa, Mastercard, Amex)
• Debit cards
• Apple Pay
• Google Pay
• PayPal (coming soon)

Billing Information:
• All payments processed securely through Stripe
• Automatic monthly or annual billing
• Email receipts sent after each payment
• View billing history in Settings
• Download invoices anytime

Upgrade Benefits:
Your upgrade takes effect immediately:
• Instant access to premium features
• No data loss or migration needed
• Seamless transition
• All existing favorites and collections preserved

Enterprise Plans:
Need a custom solution? Contact us for:
• Custom pricing for teams
• Dedicated account manager
• Custom integration options
• Priority feature requests
• Service level agreements (SLA)
• Bulk user management
• Advanced security options`
        },
        {
          id: 'billing',
          title: 'Billing and Payments',
          content: `Everything you need to know about billing:

Billing Cycle:
• Monthly plans: Billed on the same day each month
• Annual plans: Billed once per year
• Proration: Charges adjusted when upgrading/downgrading
• Grace period: 3 days to update payment info if payment fails

Managing Subscription:
Access subscription settings to:
• View current plan details
• See next billing date
• Update payment method
• View payment history
• Download invoices
• Change billing address
• Upgrade or downgrade plan

Payment Methods:
Update payment information:
1. Go to Settings > Subscription
2. Click "Update Payment Method"
3. Enter new card details
4. Save changes securely
5. Confirmation email sent

Failed Payments:
If a payment fails:
• We'll attempt to charge again after 3 days
• Email notification sent immediately
• Account remains active during grace period
• Update payment method to avoid interruption
• Contact support if you need help

Refund Policy:
• 30-day money-back guarantee
• Full refund within 30 days of purchase
• No questions asked
• Processed within 5-7 business days
• Original payment method refunded

Cancellation:
Cancel anytime:
• Access remains until end of billing period
• No early termination fees
• Data retained for 90 days
• Reactivate anytime with same account
• Automatic renewal stops after cancellation`
        }
      ]
    },
    {
      id: 'pro-features',
      title: 'Pro Features',
      icon: Star,
      description: 'Advanced capabilities for power users',
      articles: [
        {
          id: 'analytics',
          title: 'Personal Analytics',
          content: `Track your AI Universe activity with comprehensive analytics (Pro only):

Analytics Dashboard:
Your personal dashboard includes:
• Total tool views and interactions
• Favorite tools statistics
• Comparison history
• Collection insights
• Engagement score
• Activity trends over time

Activity Metrics:
Monitor your usage:
• Daily, weekly, and monthly activity
• Most viewed categories
• Peak usage times
• Streak tracking
• Time spent on platform
• Tools discovered over time

Engagement Levels:
Track your progress through tiers:
• Beginner (0-49 points)
• Active (50-149 points)
• Advanced (150-299 points)
• Expert (300-499 points)
• Elite (500+ points)

Earn points by:
• Viewing tool details
• Adding favorites
• Creating collections
• Writing reviews
• Comparing tools
• Daily login streaks

Category Insights:
Understand your preferences:
• Most browsed categories
• Favorite tool types
• Trending interests
• Discovery patterns
• Usage distribution

Time Analysis:
Optimize your workflow:
• Peak activity hours
• Most active days of the week
• Monthly comparison charts
• Session duration trends
• Activity heatmaps

Export Analytics:
• Download reports as PDF
• Export data to CSV
• Share insights with team
• Track progress over time
• Generate custom reports`
        },
        {
          id: 'recommendations',
          title: 'AI Recommendations',
          content: `Get personalized tool suggestions powered by AI (Pro only):

How It Works:
Our AI analyzes:
• Your browsing history
• Favorite tools and categories
• Comparison patterns
• Review activity
• Similar user preferences
• Trending tools in your interests

Recommendation Types:

1. Personalized Suggestions:
• Tools matching your interests
• New releases in favorite categories
• Alternatives to tools you use
• Hidden gems you might have missed

2. Similar Tools:
• Find alternatives to any tool
• Compare features side-by-side
• Discover better options
• Explore different price points

3. Trending in Your Field:
• Popular tools in your categories
• Rising stars worth watching
• Industry-specific recommendations
• Category leader updates

4. Complete Your Stack:
• Tools that complement your favorites
• Integration suggestions
• Workflow optimization tools
• Gap analysis in your toolkit

Customizing Recommendations:
Fine-tune your suggestions:
• Rate recommendations for better results
• Update your interests and preferences
• Exclude specific categories
• Set budget preferences
• Choose preferred pricing models

Recommendation Feed:
Access your personalized feed:
• Daily updated suggestions
• Weekly summary email
• In-app notifications
• Save recommendations for later
• Share with colleagues

Quality Assurance:
Our recommendations are:
• Regularly updated
• Quality-checked by our team
• Based on verified data
• Filtered for relevance
• Continuously improved`
        }
      ]
    },
    {
      id: 'account',
      title: 'Account Management',
      icon: Settings,
      description: 'Managing your account settings',
      articles: [
        {
          id: 'profile-settings',
          title: 'Profile Settings',
          content: `Customize your AI Universe profile:

Personal Information:
Update your details:
• Display name
• Email address
• Profile picture
• Bio and description
• Location
• Website or social links
• Professional title
• Areas of interest

Profile Visibility:
Control what others see:
• Public profile (visible to all users)
• Limited profile (visible to connections only)
• Private profile (only you can see)
• Show/hide activity
• Display or hide reviews
• Share collections publicly

Notification Settings:
Customize alerts:
• Email notifications
• In-app notifications
• Browser push notifications
• Mobile notifications (if app is available)

Notification Types:
• New tool additions in favorite categories
• Collection updates
• Review replies and likes
• Feature updates
• Promotional offers
• Weekly digest
• News alerts

Preferences:
Set your experience:
• Default view (grid/list)
• Results per page
• Theme preference (dark/light)
• Language selection
• Timezone
• Date format
• Currency preference

Privacy Controls:
• Who can see your profile
• Who can see your collections
• Who can see your reviews
• Data sharing preferences
• Marketing communications
• Cookie preferences`
        },
        {
          id: 'security',
          title: 'Security Settings',
          content: `Keep your account secure:

Password Management:
• Use a strong, unique password
• Minimum 8 characters
• Mix of letters, numbers, and symbols
• Change password regularly
• Don't share your password
• Use a password manager

Changing Password:
1. Go to Settings > Security
2. Click "Change Password"
3. Enter current password
4. Enter new password
5. Confirm new password
6. Save changes

Two-Factor Authentication (2FA):
Add extra security:
• Enable 2FA in security settings
• Use authenticator app or SMS
• Backup codes provided
• Required for Pro accounts
• Strongly recommended for all users

Session Management:
• View active sessions
• See device information
• Logout from other devices
• Automatic timeout after inactivity
• Secure session handling

Account Recovery:
If you're locked out:
• Use password reset link
• Verify your email address
• Answer security questions
• Contact support if needed
• Access recovery codes

Security Best Practices:
• Enable two-factor authentication
• Use unique passwords
• Review account activity regularly
• Logout on shared devices
• Keep email secure
• Be cautious of phishing attempts
• Report suspicious activity

Data & Privacy:
• Review privacy policy
• Understand data collection
• Control data sharing
• Request data export
• Delete account option
• GDPR compliance`
        }
      ]
    },
    {
      id: 'api',
      title: 'API & Integration',
      icon: Code,
      description: 'Developer resources and API access',
      articles: [
        {
          id: 'api-overview',
          title: 'API Overview',
          content: `Access AI Universe data programmatically (Coming Soon):

API Access:
Available for Pro members:
• RESTful API endpoints
• JSON response format
• Rate limiting applied
• Authentication required
• HTTPS only

Planned Endpoints:
• GET /tools - List all tools
• GET /tools/:id - Get tool details
• GET /categories - List categories
• GET /tools/search - Search tools
• GET /favorites - Get user favorites
• POST /favorites - Add favorite
• DELETE /favorites/:id - Remove favorite

Authentication:
API keys provided in settings:
• Generate API keys
• Manage multiple keys
• Rotate keys for security
• Revoke compromised keys
• Monitor usage

Rate Limits:
• Free tier: 100 requests/hour
• Creator: 1,000 requests/hour
• Pro: 10,000 requests/hour
• Enterprise: Custom limits

Response Format:
{
  "status": "success",
  "data": {...},
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150
  }
}

Error Handling:
• HTTP status codes
• Error messages
• Rate limit headers
• Retry-After header
• Error documentation

Best Practices:
• Cache responses appropriately
• Handle rate limits gracefully
• Use pagination
• Implement error handling
• Monitor API usage
• Keep API keys secure`
        }
      ]
    },
    {
      id: 'support',
      title: 'Help & Support',
      icon: HelpCircle,
      description: 'Getting help when you need it',
      articles: [
        {
          id: 'contact-support',
          title: 'Contacting Support',
          content: `Get help from our support team:

Support Channels:

1. Help Center:
• Browse documentation
• Search knowledge base
• Find quick answers
• Video tutorials
• Community forums

2. Email Support:
• Send detailed inquiries
• Attach screenshots
• Include error messages
• Response within 24 hours
• Priority for Pro members

3. Live Chat (Pro):
• Instant assistance
• Available 24/7 for Pro members
• Available business hours for others
• Screen sharing capability
• Quick problem resolution

4. Community Forum:
• Ask the community
• Share experiences
• Help other users
• Get peer support
• Vote on feature requests

Contact Information:
• Support Email: novara.team.company@gmail.com
• Response Time: 24 hours (standard), 4 hours (Pro)
• Live Chat: Available in app
• Phone Support: Enterprise only

When Contacting Support:
Include the following:
• Account email address
• Detailed description of issue
• Steps to reproduce problem
• Screenshots or screen recordings
• Browser and device information
• Error messages received

Support Hours:
• Email: 24/7
• Live Chat: 24/7 (Pro), 9am-6pm EST (others)
• Forum: Community moderated 24/7
• Phone: Enterprise custom hours

Response Times:
• Pro Priority: 4 hours
• Creator: 12 hours
• Explorer: 24 hours
• Enterprise: Custom SLA`
        },
        {
          id: 'troubleshooting',
          title: 'Troubleshooting Common Issues',
          content: `Resolve common problems quickly:

Login Issues:
• Forgot password: Use password reset link
• Email not verified: Check spam folder
• Account locked: Contact support
• 2FA problems: Use backup codes

Tool Not Loading:
• Check internet connection
• Clear browser cache
• Disable browser extensions
• Try incognito mode
• Use different browser
• Update browser to latest version

Search Not Working:
• Check spelling
• Try different keywords
• Clear search filters
• Refresh the page
• Try advanced search

Favorites Not Saving:
• Check login status
• Verify account plan limits
• Clear browser cookies
• Try different device
• Contact support if persisting

Slow Performance:
• Check internet speed
• Close unused tabs
• Clear browser cache
• Disable heavy extensions
• Try different browser
• Check device resources

Payment Issues:
• Verify card details
• Check billing address
• Ensure sufficient funds
• Contact your bank
• Try different payment method
• Contact support

Browser Compatibility:
Supported browsers:
• Chrome (recommended)
• Firefox
• Safari
• Edge
• Brave

Mobile Issues:
• Use supported browsers
• Enable JavaScript
• Clear mobile cache
• Update browser app
• Check mobile data/WiFi
• Try desktop site mode

Still Having Issues?
• Check our status page
• Visit community forum
• Submit support ticket
• Contact live chat (Pro)
• Email support team`
        }
      ]
    }
  ];

  const filteredSections = sections.filter(section =>
    searchQuery === '' ||
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.articles.some(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const currentSection = selectedSection ? sections.find(s => s.id === selectedSection) : null;
  const currentArticle = currentSection && selectedArticle
    ? currentSection.articles.find(a => a.id === selectedArticle)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl mb-6">
            <BookOpen className="w-10 h-10 text-cyan-400" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Documentation</h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Everything you need to know about using AI Universe
          </p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-6 h-6" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documentation..."
              className="w-full pl-14 pr-6 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white text-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            />
          </div>
        </div>

        {!selectedSection ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSections.map((section) => {
              const SectionIcon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-8 hover:border-cyan-500/50 transition-all group text-left"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl group-hover:scale-110 transition-transform">
                      <SectionIcon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{section.title}</h3>
                  </div>
                  <p className="text-slate-400 mb-4">{section.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">{section.articles.length} articles</span>
                    <ChevronRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        ) : !selectedArticle && currentSection ? (
          <div>
            <button
              onClick={() => setSelectedSection(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
              Back to all sections
            </button>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-8 mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
                  <currentSection.icon className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{currentSection.title}</h2>
                  <p className="text-slate-400 mt-1">{currentSection.description}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentSection.articles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => setSelectedArticle(article.id)}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all group text-left"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {article.title}
                    </h3>
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                  </div>
                  <p className="text-slate-400 text-sm line-clamp-3">
                    {article.content.substring(0, 150)}...
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : currentArticle && currentSection ? (
          <div>
            <button
              onClick={() => setSelectedArticle(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
              Back to {currentSection.title}
            </button>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-8 lg:p-12">
              <div className="flex items-center gap-3 text-sm text-slate-400 mb-6">
                <Link to="/docs" className="hover:text-white transition-colors">Documentation</Link>
                <ChevronRight className="w-4 h-4" />
                <button onClick={() => setSelectedArticle(null)} className="hover:text-white transition-colors">
                  {currentSection.title}
                </button>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white">{currentArticle.title}</span>
              </div>

              <h1 className="text-4xl font-bold text-white mb-8">{currentArticle.title}</h1>

              <div className="prose prose-invert prose-lg max-w-none">
                {currentArticle.content.split('\n\n').map((paragraph, index) => {
                  if (paragraph.startsWith('•')) {
                    const items = paragraph.split('\n');
                    return (
                      <ul key={index} className="space-y-2 mb-6">
                        {items.map((item, i) => (
                          <li key={i} className="text-slate-300 leading-relaxed">
                            {item.replace('• ', '')}
                          </li>
                        ))}
                      </ul>
                    );
                  } else if (paragraph.match(/^\d+\./)) {
                    const items = paragraph.split('\n');
                    return (
                      <ol key={index} className="list-decimal list-inside space-y-2 mb-6">
                        {items.map((item, i) => (
                          <li key={i} className="text-slate-300 leading-relaxed">
                            {item.replace(/^\d+\.\s/, '')}
                          </li>
                        ))}
                      </ol>
                    );
                  } else if (paragraph.endsWith(':')) {
                    return (
                      <h3 key={index} className="text-2xl font-bold text-white mb-4 mt-8">
                        {paragraph}
                      </h3>
                    );
                  } else {
                    return (
                      <p key={index} className="text-slate-300 leading-relaxed mb-6">
                        {paragraph}
                      </p>
                    );
                  }
                })}
              </div>

              <div className="mt-12 pt-8 border-t border-slate-700">
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <MessageCircle className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-white font-bold mb-2">Need more help?</h4>
                      <p className="text-slate-300 text-sm mb-4">
                        Can't find what you're looking for? Our support team is here to help.
                      </p>
                      <Link
                        to="/support"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm font-medium"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Contact Support
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {!selectedSection && (
          <div className="mt-12 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Still have questions?</h3>
              <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                Our support team is available 24/7 to help you get the most out of AI Universe
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  to="/support"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all font-semibold shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contact Support
                </Link>
                <a
                  href="mailto:novara.team.company@gmail.com"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all font-semibold border border-slate-700"
                >
                  <Mail className="w-5 h-5" />
                  Email Us
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
