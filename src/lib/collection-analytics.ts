import { supabase } from './supabase';

export async function trackCollectionView(collectionId: string, userId?: string) {
  try {
    await supabase
      .from('collection_views')
      .insert({
        collection_id: collectionId,
        viewer_user_id: userId || null,
        viewer_ip: null
      });
  } catch (error) {
    console.error('Error tracking collection view:', error);
  }
}

export async function trackCollectionShare(collectionId: string, userId?: string) {
  try {
    await supabase
      .from('collection_shares')
      .insert({
        collection_id: collectionId,
        shared_by_user_id: userId || null
      });
  } catch (error) {
    console.error('Error tracking collection share:', error);
  }
}

export async function getCollectionAnalytics(collectionId: string) {
  try {
    const { data: collection } = await supabase
      .from('tool_collections')
      .select('views, shares, created_at')
      .eq('id', collectionId)
      .maybeSingle();

    const { data: viewsData } = await supabase
      .from('collection_views')
      .select('viewed_at, viewer_user_id')
      .eq('collection_id', collectionId)
      .order('viewed_at', { ascending: false })
      .limit(100);

    const { data: sharesData } = await supabase
      .from('collection_shares')
      .select('shared_at, shared_by_user_id')
      .eq('collection_id', collectionId)
      .order('shared_at', { ascending: false })
      .limit(100);

    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const viewsLast7Days = viewsData?.filter(v => new Date(v.viewed_at) >= last7Days).length || 0;
    const viewsLast30Days = viewsData?.filter(v => new Date(v.viewed_at) >= last30Days).length || 0;
    const sharesLast7Days = sharesData?.filter(s => new Date(s.shared_at) >= last7Days).length || 0;
    const sharesLast30Days = sharesData?.filter(s => new Date(s.shared_at) >= last30Days).length || 0;

    const uniqueViewers = new Set(viewsData?.map(v => v.viewer_user_id).filter(Boolean)).size;

    const viewsByDay: Record<string, number> = {};
    viewsData?.forEach(view => {
      const date = new Date(view.viewed_at).toLocaleDateString();
      viewsByDay[date] = (viewsByDay[date] || 0) + 1;
    });

    const topViewDays = Object.entries(viewsByDay)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 7);

    const daysActive = Math.floor((now.getTime() - new Date(collection?.created_at || now).getTime()) / (1000 * 60 * 60 * 24));
    const avgViewsPerDay = daysActive > 0 ? (collection?.views || 0) / daysActive : 0;

    return {
      totalViews: collection?.views || 0,
      totalShares: collection?.shares || 0,
      viewsLast7Days,
      viewsLast30Days,
      sharesLast7Days,
      sharesLast30Days,
      uniqueViewers,
      avgViewsPerDay: avgViewsPerDay.toFixed(1),
      topViewDays,
      daysActive,
      recentViews: viewsData?.slice(0, 30) || [],
      recentShares: sharesData?.slice(0, 30) || [],
      engagementRate: collection?.views ? ((collection?.shares || 0) / collection.views * 100).toFixed(1) : '0'
    };
  } catch (error) {
    console.error('Error getting collection analytics:', error);
    return {
      totalViews: 0,
      totalShares: 0,
      viewsLast7Days: 0,
      viewsLast30Days: 0,
      sharesLast7Days: 0,
      sharesLast30Days: 0,
      uniqueViewers: 0,
      avgViewsPerDay: '0',
      topViewDays: [],
      daysActive: 0,
      recentViews: [],
      recentShares: [],
      engagementRate: '0'
    };
  }
}

export function exportCollectionToCSV(collection: any, tools: any[]) {
  const headers = ['Tool Name', 'Description', 'Pricing Type', 'Website', 'Rating'];
  const rows = tools.map(tool => [
    tool.ai_tools.name,
    tool.ai_tools.description,
    tool.ai_tools.pricing_type,
    tool.ai_tools.website_url,
    tool.ai_tools.rating
  ]);

  const csvContent = [
    `Collection: ${collection.name}`,
    `Description: ${collection.description || 'N/A'}`,
    `Created: ${new Date(collection.created_at).toLocaleDateString()}`,
    `Tools: ${tools.length}`,
    '',
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${collection.slug}-collection.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportCollectionToPDF(collection: any, tools: any[]) {
  const avgRating = tools.length > 0
    ? (tools.reduce((sum, t) => sum + (t.ai_tools.rating || 0), 0) / tools.length).toFixed(1)
    : '0.0';

  const pricingBreakdown = tools.reduce((acc: Record<string, number>, t) => {
    const type = t.ai_tools.pricing_type || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${collection.name} - AI Tools Collection</title>
      <style>
        @media print {
          body { margin: 0; }
          .page-break { page-break-before: always; }
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 900px;
          margin: 0 auto;
          padding: 50px 40px;
          color: #1f2937;
          background: #ffffff;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 30px;
          border-bottom: 4px solid #06b6d4;
        }
        .collection-title {
          font-size: 36px;
          font-weight: bold;
          color: #0f172a;
          margin-bottom: 15px;
        }
        .collection-subtitle {
          font-size: 16px;
          color: #64748b;
          font-style: italic;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 30px 0;
          padding: 25px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 12px;
          border: 2px solid #06b6d4;
        }
        .stat-box {
          text-align: center;
          padding: 15px;
        }
        .stat-number {
          font-size: 32px;
          font-weight: bold;
          color: #0891b2;
          margin-bottom: 5px;
        }
        .stat-label {
          font-size: 13px;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .meta-section {
          background: #f8fafc;
          padding: 25px;
          border-radius: 12px;
          margin-bottom: 35px;
          border-left: 5px solid #06b6d4;
        }
        .meta-section h2 {
          font-size: 20px;
          color: #0f172a;
          margin: 0 0 15px 0;
        }
        .meta-section p {
          margin: 8px 0;
          color: #475569;
          line-height: 1.6;
        }
        .tools-section {
          margin-top: 40px;
        }
        .section-title {
          font-size: 26px;
          font-weight: bold;
          color: #0f172a;
          margin-bottom: 25px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e2e8f0;
        }
        .tool {
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 25px;
          background: #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          transition: all 0.3s ease;
        }
        .tool:hover {
          border-color: #06b6d4;
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.1);
        }
        .tool-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
          gap: 20px;
        }
        .tool-number {
          display: inline-block;
          background: #06b6d4;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          text-align: center;
          line-height: 32px;
          font-weight: bold;
          font-size: 14px;
          margin-right: 10px;
        }
        .tool-name {
          font-size: 22px;
          font-weight: bold;
          color: #0f172a;
          flex: 1;
        }
        .tool-pricing {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
        }
        .tool-description {
          color: #475569;
          line-height: 1.8;
          margin: 15px 0;
          font-size: 15px;
        }
        .tool-details {
          display: flex;
          gap: 20px;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #e2e8f0;
          align-items: center;
        }
        .tool-rating {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #f59e0b;
          font-weight: bold;
          font-size: 16px;
        }
        .tool-website {
          color: #0891b2;
          text-decoration: none;
          font-size: 14px;
          word-break: break-all;
        }
        .pricing-breakdown {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin: 20px 0;
        }
        .pricing-item {
          background: white;
          padding: 12px;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #e2e8f0;
        }
        .pricing-count {
          font-size: 20px;
          font-weight: bold;
          color: #06b6d4;
        }
        .pricing-type {
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
        }
        .footer {
          margin-top: 50px;
          padding-top: 30px;
          border-top: 2px solid #e2e8f0;
          text-align: center;
          color: #94a3b8;
          font-size: 13px;
        }
        .footer-logo {
          font-size: 20px;
          font-weight: bold;
          color: #06b6d4;
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="collection-title">${collection.name}</div>
        <div class="collection-subtitle">${collection.description || 'Curated AI Tools Collection'}</div>
      </div>

      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-number">${tools.length}</div>
          <div class="stat-label">Total Tools</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">★ ${avgRating}</div>
          <div class="stat-label">Avg Rating</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">${collection.is_public ? 'Public' : 'Private'}</div>
          <div class="stat-label">Visibility</div>
        </div>
      </div>

      <div class="meta-section">
        <h2>Collection Information</h2>
        <p><strong>Created:</strong> ${new Date(collection.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</p>
        <p><strong>Collection ID:</strong> ${collection.slug}</p>

        <h2 style="margin-top: 20px;">Pricing Distribution</h2>
        <div class="pricing-breakdown">
          ${Object.entries(pricingBreakdown).map(([type, count]) => `
            <div class="pricing-item">
              <div class="pricing-count">${count}</div>
              <div class="pricing-type">${type}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="tools-section">
        <h2 class="section-title">AI Tools Overview</h2>
        ${tools.map((tool, index) => `
          <div class="tool">
            <div class="tool-header">
              <div style="display: flex; align-items: center; flex: 1;">
                <span class="tool-number">${index + 1}</span>
                <div class="tool-name">${tool.ai_tools.name}</div>
              </div>
              <div class="tool-pricing">${tool.ai_tools.pricing_type}</div>
            </div>
            <div class="tool-description">${tool.ai_tools.description}</div>
            <div class="tool-details">
              ${tool.ai_tools.rating > 0 ? `
                <div class="tool-rating">
                  <span>★</span>
                  <span>${tool.ai_tools.rating.toFixed(1)}</span>
                </div>
              ` : ''}
              <a href="${tool.ai_tools.website_url}" target="_blank" class="tool-website">${tool.ai_tools.website_url}</a>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="footer">
        <div class="footer-logo">AI Universe</div>
        <p>Collection exported on ${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
        <p>Visit us at ai-universe.com for more AI tools</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 750);
  }
}
