# GoPort Website Structure

> Goal: make GoPort look like a clean, trustworthy, paid developer product without overcomplicating the website.

---

# 1. Navbar

Keep the navbar simple.

**Left:**

- Product
- Use Cases
- Pricing
- Docs
- Quickstart
- GitHub

**Right:**

- Log in
- Start free

Recommended:

```text
GoPort   Product   Use Cases   Pricing   Docs   Quickstart   GitHub      Log in   Start free
```

Do not add a huge menu with many categories yet.

---

# 2. Hero Section

This is the most important part of the website.

The visitor should understand GoPort in less than 10 seconds.

## Headline

Suggested direction:

> **Expose localhost to the internet in seconds.**

## Subheadline

> Secure public URLs for local apps, APIs, webhooks, and development environments.

## Main command

```bash
goport http 3000
```

Then visually show:

```text
localhost:3000
      ↓
https://my-app.goport.uz
```

## Buttons

Primary:

**Start free**

Secondary:

**View docs**

Optional third small link:

**View on GitHub**

Do not add long paragraphs to the hero.

---

# 3. Compatible Services / Webhook Section

Put this directly after the hero or after the product demo.

Suggested heading:

> **Test webhooks from the services you already use**

Possible services:

- Payme
- Click
- MultiCard
- Other compatible webhook/API providers

Example visual:

```text
Payme / Click / Other Service
            ↓ webhook
https://shop.goport.uz
            ↓
localhost:3000/api/payment
```

Suggested text:

> Receive webhook callbacks on your local machine without deploying your application first.

Important:

Do not say:

- "Trusted by Payme"
- "Official Click partner"
- "Used by MultiCard"

unless those statements are actually true.

Use wording like:

- Works with
- Compatible with
- Test webhooks from
- Built for integrations with

Only use company logos if their branding rules allow it. Otherwise, use the company names as text.

---

# 4. Product Demo

Show what happens when someone uses GoPort.

This should be visual and easy to understand.

Example:

```bash
$ goport http 3000

Tunnel active

Local:   http://localhost:3000
Public:  https://my-app.goport.uz
Status:  Online
```

You can show:

- terminal animation
- dashboard screenshot
- request inspector screenshot

Avoid heavy animations that slow the website down.

---

# 5. Main Features

Only show the most important features.

Use 4 feature cards.

## Secure HTTPS Tunnels

> Expose your local application through a secure public HTTPS URL.

## Custom Subdomains

> Get a memorable and persistent GoPort URL for your project.

## Request Inspector

> Inspect incoming webhook requests, headers, payloads, and responses.

## WebSocket Support

> Tunnel realtime applications and WebSocket connections.

At the bottom:

**Explore all features →**

This can open the Product page.

---

# 6. Use Cases

Show developers why they would actually need GoPort.

Use around 4–6 cards.

## Test Webhooks

> Receive webhook callbacks directly on localhost.

## Payment Development

> Develop and test Payme, Click, and other payment integrations locally.

## Share Local Apps

> Share your local website with teammates, clients, or friends.

## Mobile App Development

> Connect a mobile application to an API running on your computer.

## OAuth Callbacks

> Test OAuth redirect and callback URLs without deploying.

## Client Demos

> Show a working local project to a client using a public URL.

Button:

**See all use cases →**

---

# 7. How It Works

Keep this to exactly 3 steps.

## 1. Install

Install the GoPort CLI.

## 2. Run

```bash
goport http 3000
```

## 3. Share

Get your public HTTPS URL.

Example:

```text
https://project.goport.uz
```

Suggested section title:

> **From localhost to public URL in seconds**

---

# 8. Customer Reviews / Social Proof

Place this after Use Cases or How It Works and before Pricing.

Suggested heading:

> **Loved by developers**

Use only 2–3 testimonials.

Example layout:

```text
"GoPort made testing webhooks much easier."
— Name, Backend Developer
```

```text
"I can share my local project without deploying it."
— Name, Full-stack Developer
```

Do not use fake reviews.

If you do not have enough reviews yet, show real trust signals instead:

- GitHub stars
- Number of contributors
- Number of tunnels created
- Real usage numbers
- Open-source repository
- Real feedback from beta users

Do not invent usage numbers.

---

# 9. Pricing

Put pricing directly on the homepage.

Use only 3 plans.

## Free

**$0**

Good for trying GoPort.

Possible features:

- 1–2 active tunnels
- Random subdomain
- HTTPS
- WebSocket support
- Basic request inspector

Button:

**Start free**

---

## Pro

**$2.99 / month**

Mark this plan:

**Most Popular**

Possible features:

- More simultaneous tunnels
- Persistent subdomains
- Custom domains
- Higher traffic limits
- Full request history
- Protected tunnels
- Better limits

Button:

**Get Pro**

---

## Team

**$7.99 / month**

Possible features:

- Everything in Pro
- Shared tunnels
- Shared domains
- Team members
- Higher limits
- Priority support

Button:

**Get Team**

Do not add Enterprise yet.

---

# 10. Open Source / Trust Section

GoPort should communicate that developers can trust it.

Suggested title:

> **Open source where it matters**

Possible points:

- Open-source CLI
- Self-hostable
- HTTPS support
- GitHub repository
- Transparent development

Buttons:

**View GitHub**

**Read Docs**

Only make security/privacy claims that are actually true.

---

# 11. Security / Trust Details

A small section is enough.

Possible items:

- HTTPS
- Authentication
- Protected tunnels
- Open-source CLI
- Self-hosting option
- Clear privacy policy

Optional link:

**Learn about security →**

Do not build a giant enterprise security page yet.

---

# 12. Final CTA

Near the bottom of the homepage.

Keep it simple.

Suggested headline:

> **Your localhost deserves a public URL.**

Suggested text:

> Create your first GoPort tunnel in seconds.

Buttons:

**Start free**

**View Quickstart**

---

# 13. Footer

Keep the footer small.

## Product

- Features
- Pricing
- Use Cases
- Quickstart

## Developers

- Docs
- GitHub
- Status

## Company

- Contact
- Privacy
- Terms

Optional:

- X / Twitter
- YouTube
- LinkedIn

---

# Recommended Homepage Order

Use this exact structure:

```text
Navbar
↓
Hero
↓
Compatible Services
↓
Product Demo
↓
Main Features
↓
Use Cases
↓
How It Works
↓
Customer Reviews / Social Proof
↓
Pricing
↓
Open Source / Trust
↓
Final CTA
↓
Footer
```

---

# Product Dropdown

If Product is a dropdown, keep it small.

## Tunneling

- Secure Tunnels
- Custom Subdomains
- Custom Domains

## Developer Tools

- Request Inspector
- WebSocket Support
- Dashboard

## Security

- Protected Tunnels
- Authentication

Bottom link:

**Explore all features →**

---

# Use Cases Dropdown

Possible items:

- Webhook Testing
- Payment Integrations
- Mobile Development
- API Development
- OAuth Callbacks
- Client Demos

Bottom link:

**Explore all use cases →**

---

# Quickstart Page

The Quickstart page should be extremely short.

## Step 1 — Install

Show installation commands for:

- Linux
- macOS
- Windows

## Step 2 — Log In

Show the CLI login command.

## Step 3 — Start Tunnel

```bash
goport http 3000
```

## Step 4 — Open Public URL

```text
https://my-app.goport.uz
```

That is enough.

---

# Pricing Page

The pricing page can contain:

- Free
- Pro
- Team
- Simple feature comparison
- Monthly / yearly toggle later
- FAQ at the bottom

Do not make the pricing page complicated.

---

# Docs

Docs should include:

- Installation
- CLI commands
- Authentication
- HTTP tunnels
- WebSockets
- Custom subdomains
- Custom domains
- Request inspector
- Webhook testing
- Troubleshooting

---

# Pages GoPort Should Have

At launch, these are enough:

```text
/
 /product
 /use-cases
 /pricing
 /quickstart
 /docs
 /login
 /signup
 /privacy
 /terms
 /contact
```

Optional later:

```text
/articles
/compare/ngrok
/compare/cloudflare-tunnel
/status
/security
```

---

# Things NOT To Add Yet

Avoid overcomplicating the website with:

- Enterprise page
- Partner page
- Marketplace
- Huge integrations directory
- 10+ pricing plans
- Fake reviews
- Fake customer logos
- Investor page
- Careers page
- Community forum
- Large company/about section
- Too many animations
- Huge blocks of marketing text

---

# Main Rule

Every section should help answer one of these questions:

```text
What is GoPort?
↓
Why do I need it?
↓
How does it work?
↓
Can I trust it?
↓
How much does it cost?
↓
How do I start?
```

If a section does not help answer one of those questions, it probably does not need to be on the landing page yet.
