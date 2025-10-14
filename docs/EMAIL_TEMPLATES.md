# Supabase Email Templates

Custom email templates for Rogue Leadership Training Experience. Configure these in your Supabase Dashboard under Authentication > Email Templates.

---

## 1. Invite User Email

**Path:** Authentication > Email Templates > Invite User

**Subject:**
```
You're Invited to Join Rogue Leadership Training Experience
```

**Email Body (HTML):**
```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  
  <!-- Header -->
  <div style="text-align: center; margin-bottom: 40px;">
    <div style="background: linear-gradient(135deg, #2c3e2d 0%, #1a2e1d 100%); padding: 40px; border-radius: 12px;">
      <h1 style="color: #d4af37; margin: 0; font-size: 28px; font-weight: 600;">
        Rogue Leadership Training
      </h1>
      <p style="color: #f4f1e8; margin: 8px 0 0 0; font-size: 16px;">
        Your Journey Begins Here
      </p>
    </div>
  </div>

  <!-- Content -->
  <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    <h2 style="color: #2c3e2d; margin: 0 0 16px 0; font-size: 24px;">
      Welcome to the Journey 🏔️
    </h2>
    
    <p style="color: #64748b; line-height: 1.6; margin-bottom: 24px;">
      You've been invited to join an elite cohort of leaders committed to transformative growth. 
      Over the next 8 months, you'll build unbreakable leadership foundations through Stoic philosophy, 
      interpersonal mastery, and practical application.
    </p>

    <div style="background: #f4f1e8; padding: 20px; border-radius: 8px; border-left: 4px solid #d4af37; margin-bottom: 32px;">
      <p style="color: #2c3e2d; font-size: 14px; margin: 0; line-height: 1.5;">
        <strong>Your Role:</strong> {{ .UserMetaData.role }}<br>
        <strong>Invited By:</strong> Your program administrator
      </p>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{ .ConfirmationURL }}" 
         style="display: inline-block; background: linear-gradient(135deg, #2c3e2d 0%, #1a2e1d 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(44,62,45,0.3);">
        Accept Invitation & Create Account
      </a>
    </div>

    <p style="color: #94a3b8; font-size: 14px; text-align: center; margin: 24px 0 0 0;">
      This invitation expires in 7 days
    </p>
  </div>

  <!-- Footer -->
  <div style="margin-top: 40px; text-align: center; color: #94a3b8; font-size: 14px;">
    <p style="margin: 0 0 8px 0;">
      Lead from Within. Grow with Others. Impact Your Community.
    </p>
    <p style="margin: 0;">
      © 2025 Rogue Leadership Training Experience. All rights reserved.
    </p>
  </div>

</div>
```

---

## 2. Password Reset Email

**Path:** Authentication > Email Templates > Reset Password

**Subject:**
```
Reset Your Rogue Leadership Password
```

**Email Body (HTML):**
```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  
  <!-- Header -->
  <div style="text-align: center; margin-bottom: 40px;">
    <div style="background: linear-gradient(135deg, #2c3e2d 0%, #1a2e1d 100%); padding: 40px; border-radius: 12px;">
      <h1 style="color: #d4af37; margin: 0; font-size: 28px; font-weight: 600;">
        Rogue Leadership Training
      </h1>
      <p style="color: #f4f1e8; margin: 8px 0 0 0; font-size: 16px;">
        Password Reset Request
      </p>
    </div>
  </div>

  <!-- Content -->
  <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    <h2 style="color: #2c3e2d; margin: 0 0 16px 0; font-size: 24px;">
      Reset Your Password 🔐
    </h2>
    
    <p style="color: #64748b; line-height: 1.6; margin-bottom: 24px;">
      We received a request to reset the password for your Rogue Leadership account. 
      Click the button below to create a new password.
    </p>

    <div style="background: #fef3c7; padding: 16px; border-radius: 8px; border-left: 4px solid #d4af37; margin-bottom: 32px;">
      <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.5;">
        <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, you can safely ignore this email. 
        Your password will remain unchanged.
      </p>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{ .ConfirmationURL }}" 
         style="display: inline-block; background: linear-gradient(135deg, #2c3e2d 0%, #1a2e1d 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(44,62,45,0.3);">
        Reset Password
      </a>
    </div>

    <p style="color: #94a3b8; font-size: 14px; text-align: center; margin: 24px 0 0 0;">
      This link expires in 1 hour for security
    </p>
  </div>

  <!-- Footer -->
  <div style="margin-top: 40px; text-align: center; color: #94a3b8; font-size: 14px;">
    <p style="margin: 0 0 8px 0;">
      Lead from Within. Grow with Others. Impact Your Community.
    </p>
    <p style="margin: 0;">
      © 2025 Rogue Leadership Training Experience. All rights reserved.
    </p>
  </div>

</div>
```

---

## 3. Email Change Confirmation

**Path:** Authentication > Email Templates > Change Email Address

**Subject:**
```
Confirm Your New Email Address
```

**Email Body (HTML):**
```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  
  <!-- Header -->
  <div style="text-align: center; margin-bottom: 40px;">
    <div style="background: linear-gradient(135deg, #2c3e2d 0%, #1a2e1d 100%); padding: 40px; border-radius: 12px;">
      <h1 style="color: #d4af37; margin: 0; font-size: 28px; font-weight: 600;">
        Rogue Leadership Training
      </h1>
      <p style="color: #f4f1e8; margin: 8px 0 0 0; font-size: 16px;">
        Email Address Update
      </p>
    </div>
  </div>

  <!-- Content -->
  <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    <h2 style="color: #2c3e2d; margin: 0 0 16px 0; font-size: 24px;">
      Confirm Your New Email ✉️
    </h2>
    
    <p style="color: #64748b; line-height: 1.6; margin-bottom: 24px;">
      You recently requested to change the email address associated with your Rogue Leadership account. 
      Please confirm this change by clicking the button below.
    </p>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{ .ConfirmationURL }}" 
         style="display: inline-block; background: linear-gradient(135deg, #2c3e2d 0%, #1a2e1d 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(44,62,45,0.3);">
        Confirm Email Change
      </a>
    </div>

    <p style="color: #94a3b8; font-size: 14px; text-align: center; margin: 24px 0 0 0;">
      If you didn't make this request, please contact your administrator immediately.
    </p>
  </div>

  <!-- Footer -->
  <div style="margin-top: 40px; text-align: center; color: #94a3b8; font-size: 14px;">
    <p style="margin: 0 0 8px 0;">
      Lead from Within. Grow with Others. Impact Your Community.
    </p>
    <p style="margin: 0;">
      © 2025 Rogue Leadership Training Experience. All rights reserved.
    </p>
  </div>

</div>
```

---

## 4. Magic Link Email (if used for login)

**Path:** Authentication > Email Templates > Magic Link

**Subject:**
```
Your Rogue Leadership Sign-In Link
```

**Email Body (HTML):**
```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  
  <!-- Header -->
  <div style="text-align: center; margin-bottom: 40px;">
    <div style="background: linear-gradient(135deg, #2c3e2d 0%, #1a2e1d 100%); padding: 40px; border-radius: 12px;">
      <h1 style="color: #d4af37; margin: 0; font-size: 28px; font-weight: 600;">
        Rogue Leadership Training
      </h1>
      <p style="color: #f4f1e8; margin: 8px 0 0 0; font-size: 16px;">
        Secure Sign-In Link
      </p>
    </div>
  </div>

  <!-- Content -->
  <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    <h2 style="color: #2c3e2d; margin: 0 0 16px 0; font-size: 24px;">
      Sign In to Your Account 🚀
    </h2>
    
    <p style="color: #64748b; line-height: 1.6; margin-bottom: 24px;">
      Click the button below to securely sign in to your Rogue Leadership account. 
      This link will expire shortly for your security.
    </p>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{ .ConfirmationURL }}" 
         style="display: inline-block; background: linear-gradient(135deg, #2c3e2d 0%, #1a2e1d 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(44,62,45,0.3);">
        Sign In to Dashboard
      </a>
    </div>

    <p style="color: #94a3b8; font-size: 14px; text-align: center; margin: 24px 0 0 0;">
      This link expires in 1 hour
    </p>
  </div>

  <!-- Footer -->
  <div style="margin-top: 40px; text-align: center; color: #94a3b8; font-size: 14px;">
    <p style="margin: 0 0 8px 0;">
      Lead from Within. Grow with Others. Impact Your Community.
    </p>
    <p style="margin: 0;">
      © 2025 Rogue Leadership Training Experience. All rights reserved.
    </p>
  </div>

</div>
```

---

## 5. Email Confirmation (for signups if enabled)

**Path:** Authentication > Email Templates > Confirm Signup

**Subject:**
```
Welcome to Rogue Leadership - Confirm Your Email
```

**Email Body (HTML):**
```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  
  <!-- Header -->
  <div style="text-align: center; margin-bottom: 40px;">
    <div style="background: linear-gradient(135deg, #2c3e2d 0%, #1a2e1d 100%); padding: 40px; border-radius: 12px;">
      <h1 style="color: #d4af37; margin: 0; font-size: 28px; font-weight: 600;">
        Rogue Leadership Training
      </h1>
      <p style="color: #f4f1e8; margin: 8px 0 0 0; font-size: 16px;">
        Welcome to Your Leadership Journey
      </p>
    </div>
  </div>

  <!-- Content -->
  <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    <h2 style="color: #2c3e2d; margin: 0 0 16px 0; font-size: 24px;">
      One More Step... ✨
    </h2>
    
    <p style="color: #64748b; line-height: 1.6; margin-bottom: 24px;">
      Thank you for joining Rogue Leadership Training Experience! To complete your registration 
      and access your 8-month leadership curriculum, please confirm your email address.
    </p>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{ .ConfirmationURL }}" 
         style="display: inline-block; background: linear-gradient(135deg, #2c3e2d 0%, #1a2e1d 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(44,62,45,0.3);">
        Confirm Email & Start Journey
      </a>
    </div>

    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #22c55e; margin-top: 32px;">
      <p style="color: #166534; font-size: 14px; margin: 0; line-height: 1.5;">
        <strong>What's Next:</strong><br>
        • Access 8 comprehensive leadership modules<br>
        • Join cohort calls and workshops<br>
        • Connect with your accountability partner<br>
        • Engage in transformative discussions
      </p>
    </div>
  </div>

  <!-- Footer -->
  <div style="margin-top: 40px; text-align: center; color: #94a3b8; font-size: 14px;">
    <p style="margin: 0 0 8px 0;">
      Lead from Within. Grow with Others. Impact Your Community.
    </p>
    <p style="margin: 0;">
      © 2025 Rogue Leadership Training Experience. All rights reserved.
    </p>
  </div>

</div>
```

---

## Color Reference

Use these colors from your design system in the templates:

- **Rogue Forest:** `#2c3e2d` (primary dark green)
- **Rogue Pine:** `#1a2e1d` (darker green)
- **Rogue Gold:** `#d4af37` (accent gold)
- **Rogue Cream:** `#f4f1e8` (light background)
- **Rogue Slate:** `#64748b` (body text)

---

## How to Apply These Templates

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Email Templates**
3. Select each email type
4. Replace the default content with the templates above
5. Click **Save** for each template

### Important Template Variables

Supabase provides these variables you can use:
- `{{ .ConfirmationURL }}` - The magic link/confirmation URL
- `{{ .Email }}` - The recipient's email
- `{{ .Token }}` - The confirmation token
- `{{ .UserMetaData.key }}` - Any custom metadata (like full_name, role)
- `{{ .SiteURL }}` - Your site URL

### Testing

After applying, send a test invite from your Admin panel to verify the emails look correct!

---

## Optional: Plain Text Versions

Some email clients prefer plain text. Here's a simple version:

### Invite User (Plain Text)
```
You're Invited to Rogue Leadership Training Experience

Welcome to the journey!

You've been invited to join an elite cohort of leaders committed to transformative growth. Over the next 8 months, you'll build unbreakable leadership foundations.

Your Role: {{ .UserMetaData.role }}

Accept your invitation and create your account:
{{ .ConfirmationURL }}

This invitation expires in 7 days.

---
Lead from Within. Grow with Others. Impact Your Community.
© 2025 Rogue Leadership Training Experience
```

