import { test, expect } from '@playwright/test';

test.describe('Vault Features', () => {
  test('View Original and Data Lineage', async ({ page, isMobile }) => {
    // Skip on mobile for now as navigation is different/hidden
    test.skip(isMobile, 'Sidebar navigation is hidden on mobile');

    // Ensure desktop viewport size just in case
    if (!isMobile) {
      await page.setViewportSize({ width: 1280, height: 800 });
    }

    // 1. Setup Mock Data
    const mockDoc = {
      id: 'test-doc-1',
      type: 'W-2',
      name: 'Test W-2 2024.pdf',
      taxYear: '2025',
      timestamp: new Date().toISOString(),
      dataPointCount: 3,
      fields: [
        { id: 'f1', label: 'Wages, Tips, Other Comp.', value: '$50,000.00', confidence: 0.98, status: 'PASS', mapping: 'Wage Income', lineage: 'OCR', sourceId: 'test-doc-1' },
        { id: 'f2', label: 'Federal Income Tax Withheld', value: '$5,000.00', confidence: 0.95, status: 'PASS', mapping: 'Taxes Paid', lineage: 'OCR', sourceId: 'test-doc-1' }
      ],
      confidence: 0.98,
      status: 'processed',
      sourceType: 'OCR',
      documentType: 'W-2',
      processingStatus: 'processed',
      verificationStatus: 'auto_verified',
      lineageStages: [
        { id: 'source', type: 'source', label: 'Document Uploaded', timestamp: new Date().toISOString(), status: 'completed' },
        { id: 'extraction', type: 'extraction', label: 'Data Extraction', timestamp: new Date().toISOString(), status: 'completed' },
        { id: 'verification', type: 'verification', label: 'Verification', timestamp: new Date().toISOString(), status: 'completed' }
      ],
      thumbnailUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      fileUrl: 'data:application/pdf;base64,JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmogICU...',
      mimeType: 'application/pdf'
    };

    const mockTaxData = {
      profile: { ssnProvided: true },
      filingStatus: 'single',
      dependents: 0,
      docsReceived: 1,
      incomeTotal: "$50,000.00",
      deductionsTotal: "$0.00",
      taxesPaid: "$5,000.00",
      amountDue: "$0.00",
      checks: [],
      outcome: "$0.00",
      vault: [mockDoc], 
      connectedAccounts: [],
      currentStep: 'REVIEW',
      suggestedChips: []
    };

    // 2. Inject Data
    await page.goto('/');
    
    await page.evaluate(({ doc, taxData }) => {
      localStorage.setItem('chedr_vault_documents', JSON.stringify([doc]));
      localStorage.setItem('chedr_tax_data', JSON.stringify(taxData));
      localStorage.setItem('chedr_session_state', JSON.stringify({
        messages: [],
        onboardingPhase: 'dashboard',
        isTestMode: false
      }));
    }, { doc: mockDoc, taxData: mockTaxData });

    // 3. Reload to pick up state
    await page.reload();

    // 4. Navigate to Vault via Sidebar
    // Wait for sidebar to be interactive
    const vaultNav = page.getByRole('button', { name: 'Document Vault' });
    await expect(vaultNav).toBeVisible({ timeout: 15000 });
    await vaultNav.click();

    // 5. Verify Vault List
    // Wait for the card to appear in the list
    const card = page.getByRole('button', { name: 'W-2 Test W-2 2024.pdf' }); // The card text usually combines Type + Name or accessible name logic
    // Actually, DocumentCard accessible name comes from content.
    // Let's use a locator that finds the button wrapping the specific text.
    const docCard = page.locator('button').filter({ hasText: 'Test W-2 2024.pdf' });
    await expect(docCard).toBeVisible();

    // 6. Open Document Detail
    await docCard.click();

    // 7. Verify "View Original" Feature
    // Wait for the detail view heading
    // The heading is an h2 with the document name
    await expect(page.getByRole('heading', { name: 'Test W-2 2024.pdf' })).toBeVisible({ timeout: 10000 });

    const viewButton = page.getByRole('button', { name: 'View Original' });
    await expect(viewButton).toBeVisible();

    // Click it to open modal
    await viewButton.click();
    
    // Check if modal is open (iframe for PDF)
    await expect(page.locator('iframe[title="Document Preview"]')).toBeVisible();

    // Close modal
    await page.locator('.fixed.inset-0.z-\[100\] button').click();
    await expect(page.locator('iframe[title="Document Preview"]')).toBeHidden();

    // 8. Verify Lineage
    await expect(page.getByText('Data Lineage')).toBeVisible();
    await expect(page.getByText('Document Uploaded')).toBeVisible();
    await expect(page.getByText('Data Extraction')).toBeVisible();

    // 9. Verify Data Usage
    await expect(page.getByText('Data Usage')).toBeVisible();
    // Check specific mapping (Wages -> Form 1040)
    await expect(page.getByText('Form 1040 • Line 1a')).toBeVisible();
    await expect(page.getByText('Total Income')).toBeVisible();
  });
});
