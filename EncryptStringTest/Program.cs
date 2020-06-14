using Spa.InfraCommon.SpaCommon.Helpers;
using System;

namespace EncryptStringTest
{
    public class Program
    {
#pragma warning disable IDE0060 // Remove unused parameter
        public static void Main(string[] args)
#pragma warning restore IDE0060 // Remove unused parameter
        {
            Console.ForegroundColor = ConsoleColor.Yellow;

            Console.WriteLine("Please enter a password to use:");
            string password = Console.ReadLine();
            Console.WriteLine("Please enter a string to encrypt:");
            string plaintext = Console.ReadLine();
            Console.WriteLine("");

            Console.WriteLine("Your encrypted string is:");
            string encryptedstring = SecurityHelper.Encrypt(plaintext, password);
            Console.WriteLine(encryptedstring);
            Console.WriteLine("");

            Console.WriteLine("Your encrypted string 2 is:");
            string encryptedstring2 = SecurityHelper.EncryptPasswordHash(plaintext);
            Console.WriteLine(encryptedstring2);
            Console.WriteLine("");

            Console.WriteLine("Your decrypted string is:");
            string decryptedstring = SecurityHelper.Decrypt(encryptedstring, password);
            Console.WriteLine(decryptedstring);
            Console.WriteLine("");

            Console.WriteLine("Press any key to exit...");
            Console.ReadLine();
        }
    }
}
