"""
Email Service for sending notifications
"""
from flask import current_app, render_template_string
from flask_mail import Message
from app import mail, db
from app.models import EmailLog


class EmailService:
    """Service for sending email notifications"""
    
    @staticmethod
    def send_email(to_email, to_name, subject, body, separation_case_id=None, template_name=None):
        """Send an email and log it"""
        try:
            msg = Message(
                subject=subject,
                recipients=[to_email],
                html=body
            )
            
            # Send email
            mail.send(msg)
            
            # Log email
            log = EmailLog(
                separation_case_id=separation_case_id,
                recipient_email=to_email,
                recipient_name=to_name,
                subject=subject,
                template_name=template_name,
                status='sent'
            )
            db.session.add(log)
            db.session.commit()
            
            return True
            
        except Exception as e:
            current_app.logger.error(f"Failed to send email: {str(e)}")
            
            # Log failed email
            log = EmailLog(
                separation_case_id=separation_case_id,
                recipient_email=to_email,
                recipient_name=to_name,
                subject=subject,
                template_name=template_name,
                status='failed',
                error_message=str(e)
            )
            db.session.add(log)
            db.session.commit()
            
            return False
    
    @staticmethod
    def send_case_created_notification(case):
        """Send notification when a new separation case is created"""
        subject = f"New Separation Case Created - {case.case_number}"
        
        body = render_template_string("""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2563eb;">New Separation Case Created</h2>
                <p>A new separation case has been initiated:</p>
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Case Number:</strong> {{ case.case_number }}</p>
                    <p><strong>Employee:</strong> {{ case.employee.full_name }}</p>
                    <p><strong>Resignation Date:</strong> {{ case.resignation_date }}</p>
                    <p><strong>Last Working Day:</strong> {{ case.last_working_day }}</p>
                </div>
                <p>Please log in to the system to view the case details and complete your checklist.</p>
                <a href="{{ url }}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">View Case</a>
            </div>
        </body>
        </html>
        """, case=case, url=f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/cases/{case.id}")
        
        # Send to employee
        EmailService.send_email(
            to_email=case.employee.email,
            to_name=case.employee.full_name,
            subject=subject,
            body=body,
            separation_case_id=case.id,
            template_name='case_created'
        )
        
        # Send to direct manager if assigned
        if case.direct_manager:
            EmailService.send_email(
                to_email=case.direct_manager.email,
                to_name=case.direct_manager.full_name,
                subject=subject,
                body=body,
                separation_case_id=case.id,
                template_name='case_created_manager'
            )
    
    @staticmethod
    def send_checklist_submitted_notification(case):
        """Send notification when checklist is submitted"""
        if not case.direct_manager:
            return
        
        subject = f"Checklist Submitted - {case.case_number}"
        
        body = render_template_string("""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2563eb;">Checklist Submitted for Review</h2>
                <p>Dear {{ manager.first_name }},</p>
                <p>The separation checklist has been submitted for your review:</p>
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Case Number:</strong> {{ case.case_number }}</p>
                    <p><strong>Employee:</strong> {{ case.employee.full_name }}</p>
                    <p><strong>Submitted At:</strong> {{ case.checklist_submitted_at }}</p>
                </div>
                <p>Please review the checklist and proceed with the sign-off process.</p>
                <a href="{{ url }}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">Review Checklist</a>
            </div>
        </body>
        </html>
        """, case=case, manager=case.direct_manager, url=f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/cases/{case.id}")
        
        EmailService.send_email(
            to_email=case.direct_manager.email,
            to_name=case.direct_manager.full_name,
            subject=subject,
            body=body,
            separation_case_id=case.id,
            template_name='checklist_submitted'
        )
    
    @staticmethod
    def send_signoff_assignment_notification(signoff):
        """Send notification when assigned for sign-off"""
        case = signoff.separation_case
        subject = f"Sign-off Assignment - {case.case_number}"
        
        body = render_template_string("""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2563eb;">Sign-off Assignment</h2>
                <p>Dear {{ assignee.first_name }},</p>
                <p>You have been assigned to review and sign off on a separation case:</p>
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Case Number:</strong> {{ case.case_number }}</p>
                    <p><strong>Employee:</strong> {{ case.employee.full_name }}</p>
                    <p><strong>Department:</strong> {{ signoff.department.name }}</p>
                    <p><strong>Last Working Day:</strong> {{ case.last_working_day }}</p>
                </div>
                <p>Please review the case and complete your department sign-off.</p>
                <a href="{{ url }}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">Process Sign-off</a>
            </div>
        </body>
        </html>
        """, case=case, signoff=signoff, assignee=signoff.assignee, url=f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/signoffs/{signoff.id}")
        
        EmailService.send_email(
            to_email=signoff.assignee.email,
            to_name=signoff.assignee.full_name,
            subject=subject,
            body=body,
            separation_case_id=case.id,
            template_name='signoff_assigned'
        )
    
    @staticmethod
    def send_signoff_processed_notification(signoff):
        """Send notification when sign-off is processed"""
        case = signoff.separation_case
        status_text = 'approved' if signoff.status == 'approved' else 'rejected'
        subject = f"Sign-off {status_text.title()} - {case.case_number}"
        
        body = render_template_string("""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: {{ '#22c55e' if signoff.status == 'approved' else '#ef4444' }};">
                    Sign-off {{ signoff.status.title() }}
                </h2>
                <p>A sign-off has been processed for separation case {{ case.case_number }}:</p>
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Department:</strong> {{ signoff.department.name }}</p>
                    <p><strong>Status:</strong> {{ signoff.status.title() }}</p>
                    <p><strong>Processed By:</strong> {{ signoff.assignee.full_name }}</p>
                    {% if signoff.comments %}
                    <p><strong>Comments:</strong> {{ signoff.comments }}</p>
                    {% endif %}
                </div>
                <a href="{{ url }}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">View Case</a>
            </div>
        </body>
        </html>
        """, case=case, signoff=signoff, url=f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/cases/{case.id}")
        
        # Send to employee
        EmailService.send_email(
            to_email=case.employee.email,
            to_name=case.employee.full_name,
            subject=subject,
            body=body,
            separation_case_id=case.id,
            template_name='signoff_processed'
        )
    
    @staticmethod
    def send_separation_completed_notification(case):
        """Send notification when separation is completed"""
        subject = f"Separation Process Completed - {case.case_number}"
        
        body = render_template_string("""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #22c55e;">Separation Process Completed</h2>
                <p>Dear {{ case.employee.first_name }},</p>
                <p>Your separation process has been successfully completed.</p>
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Case Number:</strong> {{ case.case_number }}</p>
                    <p><strong>Last Working Day:</strong> {{ case.last_working_day }}</p>
                    <p><strong>Completed At:</strong> {{ case.completed_at }}</p>
                </div>
                <p>All required sign-offs have been obtained and your exit process is now complete.</p>
                <p>We wish you all the best in your future endeavors.</p>
            </div>
        </body>
        </html>
        """, case=case, url=f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/cases/{case.id}")
        
        EmailService.send_email(
            to_email=case.employee.email,
            to_name=case.employee.full_name,
            subject=subject,
            body=body,
            separation_case_id=case.id,
            template_name='separation_completed'
        )
