'use server';

// This is a server action. It runs only on the server.

export async function handleContactForm(prevState, formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');

  // --- Basic Validation ---
  if (!name || !email || !message) {
    return { status: 'error', message: 'يرجى ملء جميع الحقول.' };
  }

  // --- Simulate Backend Logic ---
  // In a real application, you would use a service like Resend, Nodemailer, or SendGrid
  // to send an email with the form data.
  console.log('New Contact Form Submission:');
  console.log('Name:', name);
  console.log('Email:', email);
  console.log('Message:', message);

  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // --- Return Success State ---
  return { status: 'success', message: 'تم إرسال رسالتك بنجاح! شكرًا لك.' };
}