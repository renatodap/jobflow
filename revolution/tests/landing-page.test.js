const fs = require('fs');
const path = require('path');

// Simple HTML validation test
function testLandingPage() {
    console.log('🧪 Testing Landing Page...\n');
    
    const landingPagePath = path.join(__dirname, '..', 'index.html');
    
    // Test 1: File exists
    if (!fs.existsSync(landingPagePath)) {
        console.log('❌ Landing page file does not exist');
        return false;
    }
    console.log('✅ Landing page file exists');
    
    // Test 2: Read file content
    const content = fs.readFileSync(landingPagePath, 'utf8');
    
    // Test 3: Basic HTML structure
    const hasDoctype = content.includes('<!DOCTYPE html>');
    const hasTitle = content.includes('<title>');
    const hasMetaViewport = content.includes('name="viewport"');
    
    console.log(`✅ Has DOCTYPE: ${hasDoctype}`);
    console.log(`✅ Has title tag: ${hasTitle}`);
    console.log(`✅ Has viewport meta: ${hasMetaViewport}`);
    
    // Test 4: Required elements for waitlist
    const hasEmailInput = content.includes('type="email"');
    const hasFormSubmit = content.includes('type="submit"');
    const hasWaitlistForm = content.includes('id="waitlistForm"');
    
    console.log(`✅ Has email input: ${hasEmailInput}`);
    console.log(`✅ Has submit button: ${hasFormSubmit}`);
    console.log(`✅ Has waitlist form: ${hasWaitlistForm}`);
    
    // Test 5: Analytics placeholder
    const hasAnalytics = content.includes('GA_MEASUREMENT_ID');
    console.log(`✅ Has analytics placeholder: ${hasAnalytics}`);
    
    // Test 6: Key messaging
    const hasBrandName = content.includes('Pulse Daily');
    const hasValueProp = content.includes('Know What\'s Trending') || content.includes('Premium Intelligence');
    const hasCTA = content.includes('Get Early Access');
    
    console.log(`✅ Has brand name: ${hasBrandName}`);
    console.log(`✅ Has value proposition: ${hasValueProp}`);
    console.log(`✅ Has call-to-action: ${hasCTA}`);
    
    // Test 7: Performance optimizations
    const hasTailwindCDN = content.includes('tailwindcss.com');
    const hasAsyncAnalytics = content.includes('async');
    
    console.log(`✅ Has Tailwind CSS: ${hasTailwindCDN}`);
    console.log(`✅ Has async analytics: ${hasAsyncAnalytics}`);
    
    // Test 8: Mobile responsiveness indicators
    const hasResponsiveClasses = content.includes('md:') && content.includes('sm:');
    console.log(`✅ Has responsive classes: ${hasResponsiveClasses}`);
    
    // Test 9: Form validation
    const hasEmailValidation = content.includes('validateEmail');
    const hasFormHandling = content.includes('handleFormSubmit');
    
    console.log(`✅ Has email validation: ${hasEmailValidation}`);
    console.log(`✅ Has form handling: ${hasFormHandling}`);
    
    // Test 10: File size check (should be reasonable for fast loading)
    const sizeKB = Math.round(content.length / 1024);
    const isReasonableSize = sizeKB < 100; // Less than 100KB for fast loading
    
    console.log(`✅ File size: ${sizeKB}KB (${isReasonableSize ? 'Good' : 'Large'})`);
    
    const allTestsPassed = hasDoctype && hasTitle && hasMetaViewport && hasEmailInput && 
                          hasFormSubmit && hasWaitlistForm && hasAnalytics && hasBrandName && 
                          hasValueProp && hasCTA && hasTailwindCDN && hasResponsiveClasses && 
                          hasEmailValidation && hasFormHandling && isReasonableSize;
    
    console.log(`\n${allTestsPassed ? '🎉' : '❌'} Overall Test Result: ${allTestsPassed ? 'PASSED' : 'FAILED'}`);
    
    return allTestsPassed;
}

// Run the test
if (require.main === module) {
    const success = testLandingPage();
    process.exit(success ? 0 : 1);
}

module.exports = { testLandingPage };