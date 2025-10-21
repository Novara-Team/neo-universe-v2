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
      .select('views, shares')
      .eq('id', collectionId)
      .maybeSingle();

    const { data: viewsData } = await supabase
      .from('collection_views')
      .select('viewed_at')
      .eq('collection_id', collectionId)
      .order('viewed_at', { ascending: false })
      .limit(30);

    const { data: sharesData } = await supabase
      .from('collection_shares')
      .select('shared_at')
      .eq('collection_id', collectionId)
      .order('shared_at', { ascending: false })
      .limit(30);

    return {
      totalViews: collection?.views || 0,
      totalShares: collection?.shares || 0,
      recentViews: viewsData || [],
      recentShares: sharesData || []
    };
  } catch (error) {
    console.error('Error getting collection analytics:', error);
    return {
      totalViews: 0,
      totalShares: 0,
      recentViews: [],
      recentShares: []
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
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${collection.name} - AI Tools Collection</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          color: #333;
        }
        h1 {
          color: #1a1a1a;
          border-bottom: 3px solid #06b6d4;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .meta {
          background: #f3f4f6;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .meta p {
          margin: 5px 0;
          color: #555;
        }
        .tool {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          background: #ffffff;
        }
        .tool-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .tool-name {
          font-size: 20px;
          font-weight: bold;
          color: #1a1a1a;
        }
        .tool-pricing {
          background: #06b6d4;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        .tool-description {
          color: #555;
          line-height: 1.6;
          margin: 10px 0;
        }
        .tool-website {
          color: #06b6d4;
          text-decoration: none;
          font-size: 14px;
        }
        .tool-rating {
          color: #f59e0b;
          font-weight: bold;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #888;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <h1>${collection.name}</h1>
      <div class="meta">
        <p><strong>Description:</strong> ${collection.description || 'No description provided'}</p>
        <p><strong>Created:</strong> ${new Date(collection.created_at).toLocaleDateString()}</p>
        <p><strong>Total Tools:</strong> ${tools.length}</p>
        <p><strong>Visibility:</strong> ${collection.is_public ? 'Public' : 'Private'}</p>
      </div>
      ${tools.map((tool, index) => `
        <div class="tool">
          <div class="tool-header">
            <div class="tool-name">${index + 1}. ${tool.ai_tools.name}</div>
            <div class="tool-pricing">${tool.ai_tools.pricing_type}</div>
          </div>
          <div class="tool-description">${tool.ai_tools.description}</div>
          ${tool.ai_tools.rating > 0 ? `<p class="tool-rating">★ ${tool.ai_tools.rating.toFixed(1)}</p>` : ''}
          <a href="${tool.ai_tools.website_url}" target="_blank" class="tool-website">${tool.ai_tools.website_url}</a>
        </div>
      `).join('')}
      <div class="footer">
        <p>Generated from AI Universe Collection</p>
        <p>${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
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
    }, 500);
  }
}
