import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'huseyint428@gmail.com',
    pass: 'hubk czon tbzb kbmr'
  }
});

export async function sendVerificationEmail(email: string, verificationCode: string) {
  const mailOptions = {
    from: 'huseyint428@gmail.com',
    to: email,
    subject: 'DataLinguaLab - Email Verification / E-posta Doğrulama',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">DataLinguaLab</h1>
          <p style="color: #6b7280; margin: 0;">Turkish Data Collection Platform</p>
        </div>
        
        <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-top: 0;">Verify Your Email Address</h2>
          <h2 style="color: #1f2937; margin-top: 0;">E-posta Adresinizi Doğrulayın</h2>
          
          <p style="color: #374151; line-height: 1.6;">
            Thank you for registering with DataLinguaLab. Please use the verification code below to verify your email address:
          </p>
          <p style="color: #374151; line-height: 1.6;">
            DataLinguaLab'a kaydolduğunuz için teşekkür ederiz. E-posta adresinizi doğrulamak için aşağıdaki doğrulama kodunu kullanın:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: #2563eb; color: white; padding: 15px 30px; border-radius: 6px; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
              ${verificationCode}
            </div>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            This code will expire in 15 minutes. / Bu kod 15 dakika içinde geçerliliğini yitirecektir.
          </p>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 12px;">
          <p>DataLinguaLab - Supported by TÜBİTAK</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  const mailOptions = {
    from: 'huseyint428@gmail.com',
    to: email,
    subject: 'Welcome to DataLinguaLab - Account Approved / DataLinguaLab\'a Hoş Geldiniz - Hesabınız Onaylandı',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">DataLinguaLab</h1>
          <p style="color: #6b7280; margin: 0;">Turkish Data Collection Platform</p>
        </div>
        
        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-top: 0;">🎉 Welcome to DataLinguaLab!</h2>
          <h2 style="color: #1f2937; margin-top: 0;">🎉 DataLinguaLab'a Hoş Geldiniz!</h2>
          
          <p style="color: #374151; line-height: 1.6;">
            Dear ${name},
          </p>
          <p style="color: #374151; line-height: 1.6;">
            Sayın ${name},
          </p>
          
          <p style="color: #374151; line-height: 1.6;">
            Great news! Your account has been approved by our admin team. You can now log in and start creating surveys for Turkish language data collection.
          </p>
          <p style="color: #374151; line-height: 1.6;">
            Harika bir haber! Hesabınız yönetici ekibimiz tarafından onaylandı. Artık giriş yapabilir ve Türkçe dil verisi toplama için anketler oluşturmaya başlayabilirsiniz.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" 
               style="display: inline-block; background: #2563eb; color: white; padding: 15px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              Login to Your Account / Hesabınıza Giriş Yapın
            </a>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            If you have any questions, please don't hesitate to contact our support team.
          </p>
          <p style="color: #374151; line-height: 1.6;">
            Herhangi bir sorunuz varsa, destek ekibimizle iletişime geçmekten çekinmeyin.
          </p>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 12px;">
          <p>DataLinguaLab - Supported by TÜBİTAK</p>
          <p>This research is supported by TÜBİTAK (The Scientific and Technological Research Council of Turkey)</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Welcome email sending error:', error);
    return { success: false, error };
  }
}