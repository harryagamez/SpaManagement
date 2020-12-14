using Spa.InfraCommon.SpaCommon.Models;
using System;
using System.Net.Mail;

namespace Spa.InfraCommon.SpaCommon.Helpers
{
    public static class MailHelper
    {
        public static bool SendMail(EmailModel eMailModel)
        {
            try
            {
                MailMessage message = new MailMessage
                {
                    From = new MailAddress("notificaciones@beuxit.com"),
                    Subject = eMailModel.Subject,
                    Body = eMailModel.Body
                };
                message.To.Add(eMailModel.MailTo);
                message.IsBodyHtml = true;

                SmtpClient smtp = new SmtpClient("mail.beuxit.com", 587)
                {                    
                    EnableSsl = true,
                    Timeout = int.MaxValue,
                    UseDefaultCredentials = false,                    
                    Credentials = new System.Net.NetworkCredential("notificaciones@beuxit.com", "Midgardyggdrasil?"),
                };
                smtp.Send(message);

                return true;
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}