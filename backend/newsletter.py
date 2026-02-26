"""
Newsletter system for BritSyncAI Academy
Handles subscriptions, AI blog generation, and weekly email distribution
"""

from pydantic import EmailStr
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import logging
import re
import os

logger = logging.getLogger(__name__)


def slugify(text: str) -> str:
    """Convert text to URL-friendly slug"""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text


async def generate_weekly_blog(db):
    """Generate AI blog post about featured course"""
    try:
        # Get most popular/latest published course
        popular_course = await db.courses.find_one(
            {"status": "published"},
            sort=[("created_at", -1)]
        )
        
        if not popular_course:
            logger.info("No published courses found for blog generation")
            return None
        
        # Get instructor name
        instructor = await db.instructors.find_one({"id": popular_course.get('instructor_id')})
        instructor_name = "our expert instructor"
        if instructor:
            user = await db.users.find_one({"id": instructor['user_id']})
            instructor_name = user['name'] if user else instructor_name
        
        # Create AI prompt
        prompt = f"""Write a 400-word blog post about this online course in a friendly, motivational tone:

Course Title: {popular_course['title']}
Description: {popular_course.get('description', 'Learn essential skills')}
Category: {popular_course.get('category', 'General')}
Instructor: {instructor_name}

The blog should:
- Explain what students will learn and why it matters
- Highlight the key benefits and outcomes
- Include motivation for online learning
- End with a subtle call-to-action to explore the course
- Be SEO-friendly and engaging
- Use markdown formatting with headers (##, ###)

Format: Markdown
Length: 400-500 words
"""
        
        # Call Groq AI
        chat = LlmChat(
            api_key=os.environ.get('GROQ_API_KEY'),
            session_id="newsletter-gen"
        ).with_model("groq", "llama-3.3-70b-versatile")
        
        content = await chat.send_message(UserMessage(text=prompt))
        
        # Generate title
        title_prompt = f"Create a catchy, engaging blog post title (max 60 chars) about: {popular_course['title']}"
        title_response = await chat.send_message(UserMessage(text=title_prompt))
        title = title_response.strip().replace('"', '')
        
        # Create excerpt (first 150 chars)
        excerpt = content[:150].strip() + "..."
        
        # Create blog post
        blog_slug = slugify(title)
        blog_doc = {
            "id": str(__import__('uuid').uuid4()),
            "title": title,
            "slug": blog_slug,
            "content": content,
            "excerpt": excerpt,
            "cover_image": popular_course.get('thumbnail'),
            "course_id": popular_course['id'],
            "author_id": popular_course['instructor_id'],
            "category": "Newsletter",
            "status": "published",
            "views": 0,
            "sent_to_subscribers": False,
            "email_sent_count": 0,
            "published_at": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Save to database
        await db.blog_posts.insert_one(blog_doc)
        
        logger.info(f"Generated blog post: {title}")
        return blog_doc
        
    except Exception as e:
        logger.error(f"Failed to generate weekly blog: {e}")
        return None


async def send_newsletter_email(blog_post, subscriber_email, unsubscribe_token):
    """Send newsletter email to a single subscriber"""
    try:
        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        course_url = f"{frontend_url}/courses/{blog_post['course_id']}" if blog_post.get('course_id') else frontend_url
        unsubscribe_url = f"{frontend_url}/unsubscribe?token={unsubscribe_token}"
        
        # Create HTML email
        html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1a202c; margin: 0; padding: 0; background-color: #f8fafc; }}
        .wrapper {{ width: 100%; padding: 40px 0; background-color: #f8fafc; }}
        .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }}
        .header {{ background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 50px 40px; text-align: center; color: white; }}
        .header h1 {{ margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.025em; }}
        .header p {{ margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; font-weight: 500; }}
        .content {{ padding: 40px; }}
        .content h2 {{ color: #1e293b; font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 20px; line-height: 1.3; }}
        .blog-image {{ width: 100%; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }}
        .text-content {{ color: #475569; font-size: 16px; line-height: 1.8; }}
        .cta-container {{ text-align: center; margin-top: 40px; margin-bottom: 20px; }}
        .cta-button {{ 
            display: inline-block; 
            background: linear-gradient(to r, #4f46e5, #7c3aed); 
            color: #ffffff !important; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 14px; 
            font-weight: 700; 
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
            transition: transform 0.2s ease;
        }}
        .footer {{ padding: 30px 40px; text-align: center; font-size: 13px; color: #94a3b8; background-color: #f8fafc; border-top: 1px solid #f1f5f9; }}
        .footer a {{ color: #6366f1; text-decoration: none; font-weight: 600; }}
        .badge {{ display: inline-block; padding: 6px 12px; border-radius: 99px; background: #eef2ff; color: #4f46e5; font-size: 12px; font-weight: 700; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.05em; }}
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1>BritSyncAI Academy</h1>
                <p>Your Weekly Dose of Innovation</p>
            </div>
            
            <div class="content">
                <span class="badge">Weekly Newsletter</span>
                <h2>{blog_post['title']}</h2>
                
                {f'<img src="{blog_post["cover_image"]}" alt="Course thumbnail" class="blog-image">' if blog_post.get('cover_image') else ''}
                
                <div class="text-content">
                    {blog_post['content'].replace(chr(10), '<br>')}
                </div>
                
                <div class="cta-container">
                    <a href="{course_url}" class="cta-button">Access Today's Course →</a>
                </div>
            </div>
            
            <div class="footer">
                <p>You are receiving this because you are part of the BritSyncAI Academy community.</p>
                <p>
                    <a href="{unsubscribe_url}">Unsubscribe</a> • 
                    <a href="{frontend_url}">Visit Website</a> • 
                    <a href="mailto:support@britsyncaiacademy.online">Support</a>
                </p>
                <p style="margin-top: 15px;">© 2026 BritSyncAI Academy. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
"""
        
        # Send via SendGrid
        api_key = os.environ.get('SENDGRID_API_KEY')
        sender = os.environ.get('SENDER_EMAIL', 'newsletter@britsyncaiacademy.online')
        
        if not api_key:
            logger.warning("SENDGRID_API_KEY missing. Skipping newsletter email.")
            return False

        sg = SendGridAPIClient(api_key)
        message = Mail(
            from_email=sender,
            to_emails=subscriber_email,
            subject=f"🚀 {blog_post['title']} | BritSyncAI Academy",
            html_content=html_content
        )
        
        sg.send(message)
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {subscriber_email}: {e}")
        return False


async def send_weekly_newsletter(db):
    """Send latest blog to all subscribers"""
    try:
        # Get latest unsent blog post
        blog = await db.blog_posts.find_one(
            {"sent_to_subscribers": False, "category": "Newsletter"},
            sort=[("published_at", -1)]
        )
        
        if not blog:
            logger.info("No new newsletter to send")
            return {"message": "No newsletter to send", "sent": 0}
        
        # Get all subscribed emails
        subscriptions = await db.email_subscriptions.find(
            {"subscribed": True}
        ).to_list(10000)
        
        if not subscriptions:
            logger.info("No subscribers found")
            return {"message": "No subscribers", "sent": 0}
        
        # Send to all subscribers
        sent_count = 0
        for subscription in subscriptions:
            success = await send_newsletter_email(
                blog, 
                subscription['email'], 
                subscription['unsubscribe_token']
            )
            if success:
                sent_count += 1
        
        # Mark as sent
        await db.blog_posts.update_one(
            {"id": blog['id']},
            {"$set": {
                "sent_to_subscribers": True,
                "email_sent_count": sent_count
            }}
        )
        
        logger.info(f"Newsletter sent to {sent_count}/{len(subscriptions)} subscribers")
        return {"message": f"Sent to {sent_count} subscribers", "sent": sent_count}
        
    except Exception as e:
        logger.error(f"Failed to send newsletter: {e}")
        return {"error": str(e)}
