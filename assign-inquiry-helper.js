/**
 * Helper script to assign an inquiry to the current logged-in user
 *
 * HOW TO USE:
 * 1. Open the inquiry detail page in your browser
 * 2. Open browser console (F12 or Cmd+Option+I)
 * 3. Copy and paste this entire script into the console
 * 4. Press Enter
 * 5. The page will refresh and show the Smart Reply Panel
 */

(async function assignInquiryToMe() {
  try {
    // Get inquiry ID from URL
    const inquiryId = window.location.pathname.split('/').pop();
    console.log('📋 Inquiry ID:', inquiryId);

    // Get Supabase client from window (it's available globally in your app)
    const supabase = window.supabase;

    if (!supabase) {
      console.error('❌ Supabase client not found. Make sure you\'re on the inquiry page.');
      return;
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('❌ Not logged in or error getting user:', userError);
      return;
    }

    console.log('👤 Current user ID:', user.id);

    // Update the inquiry to assign it to current user
    const { data, error } = await supabase
      .from('inquiries')
      .update({
        assigned_to: user.id,
        status: 'assigned'
      })
      .eq('id', inquiryId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error assigning inquiry:', error);
      return;
    }

    console.log('✅ Successfully assigned inquiry to you!');
    console.log('🔄 Refreshing page...');

    // Refresh the page to show the Smart Reply Panel
    window.location.reload();

  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
