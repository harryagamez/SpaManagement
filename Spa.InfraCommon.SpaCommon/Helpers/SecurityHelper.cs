﻿using System;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace Spa.InfraCommon.SpaCommon.Helpers
{
    public static class SecurityHelper
    {
        private const int Keysize = 256;

        private const int DerivationIterations = 1000;

        // NonDeterministic Methods
        public static string Encrypt(string plainText, string passPhrase)
        {
            byte[] saltStringBytes = Generate256BitsOfRandomEntropy();
            byte[] ivStringBytes = Generate256BitsOfRandomEntropy();
            byte[] plainTextBytes = Encoding.UTF8.GetBytes(plainText);

            using (Rfc2898DeriveBytes password = new Rfc2898DeriveBytes(passPhrase, saltStringBytes, DerivationIterations))
            {
                byte[] keyBytes = password.GetBytes(Keysize / 8);
                using (RijndaelManaged symmetricKey = new RijndaelManaged())
                {
                    symmetricKey.BlockSize = 256;
                    symmetricKey.Mode = CipherMode.CBC;
                    symmetricKey.Padding = PaddingMode.PKCS7;
                    using (ICryptoTransform encryptor = symmetricKey.CreateEncryptor(keyBytes, ivStringBytes))
                    {
                        using (MemoryStream memoryStream = new MemoryStream())
                        {
                            using (CryptoStream cryptoStream = new CryptoStream(memoryStream, encryptor, CryptoStreamMode.Write))
                            {
                                cryptoStream.Write(plainTextBytes, 0, plainTextBytes.Length);
                                cryptoStream.FlushFinalBlock();
                                byte[] cipherTextBytes = saltStringBytes;
                                cipherTextBytes = cipherTextBytes.Concat(ivStringBytes).ToArray();
                                cipherTextBytes = cipherTextBytes.Concat(memoryStream.ToArray()).ToArray();
                                memoryStream.Close();
                                cryptoStream.Close();
                                return Convert.ToBase64String(cipherTextBytes);
                            }
                        }
                    }
                }
            }
        }

        public static string Decrypt(string cipherText, string passPhrase)
        {
            byte[] cipherTextBytesWithSaltAndIv = Convert.FromBase64String(cipherText);
            byte[] saltStringBytes = cipherTextBytesWithSaltAndIv.Take(Keysize / 8).ToArray();
            byte[] ivStringBytes = cipherTextBytesWithSaltAndIv.Skip(Keysize / 8).Take(Keysize / 8).ToArray();
            byte[] cipherTextBytes = cipherTextBytesWithSaltAndIv.Skip((Keysize / 8) * 2).Take(cipherTextBytesWithSaltAndIv.Length - ((Keysize / 8) * 2)).ToArray();

            using (Rfc2898DeriveBytes password = new Rfc2898DeriveBytes(passPhrase, saltStringBytes, DerivationIterations))
            {
                byte[] keyBytes = password.GetBytes(Keysize / 8);
                using (RijndaelManaged symmetricKey = new RijndaelManaged())
                {
                    symmetricKey.BlockSize = 256;
                    symmetricKey.Mode = CipherMode.CBC;
                    symmetricKey.Padding = PaddingMode.PKCS7;
                    using (var decryptor = symmetricKey.CreateDecryptor(keyBytes, ivStringBytes))
                    {
                        using (MemoryStream memoryStream = new MemoryStream(cipherTextBytes))
                        {
                            using (CryptoStream cryptoStream = new CryptoStream(memoryStream, decryptor, CryptoStreamMode.Read))
                            {
                                byte[] plainTextBytes = new byte[cipherTextBytes.Length];
                                int decryptedByteCount = cryptoStream.Read(plainTextBytes, 0, plainTextBytes.Length);
                                memoryStream.Close();
                                cryptoStream.Close();
                                return Encoding.UTF8.GetString(plainTextBytes, 0, decryptedByteCount);
                            }
                        }
                    }
                }
            }
        }

        private static byte[] Generate256BitsOfRandomEntropy()
        {
            byte[] randomBytes = new byte[32];
            using (RNGCryptoServiceProvider rngCsp = new RNGCryptoServiceProvider())
            {
                rngCsp.GetBytes(randomBytes);
            }
            return randomBytes;
        }

        // Deterministic Method
        public static string EncryptPasswordHash(string plainText)
        {
            UnicodeEncoding Encode = new UnicodeEncoding();
            byte[] data = Encode.GetBytes(plainText);
            byte[] Result;
            string EncryptedData;

            SHA1CryptoServiceProvider HashObject = new SHA1CryptoServiceProvider();
            Result = HashObject.ComputeHash(data);

            StringBuilder sBuilder = new StringBuilder();

            for (int item = 0; item <= Result.Length - 1; item++)
                sBuilder.Append(Result[item].ToString("x2"));

            EncryptedData = sBuilder.ToString();

            return EncryptedData;
        }

        // Deterministic Methods
        public static string EncryptPassword(string value, string Key)
        {
            TripleDESCryptoServiceProvider TDESAlgorithm = new TripleDESCryptoServiceProvider
            {
                IV = new byte[8]
            };

            PasswordDeriveBytes Password = new PasswordDeriveBytes(Key, new byte[0]);
            TDESAlgorithm.Key = Password.CryptDeriveKey("TripleDES", "MD5", 168, new byte[8]);
            MemoryStream MemoryStream = new MemoryStream(value.Length * 2 - 1);
            CryptoStream encStream = new CryptoStream(MemoryStream, TDESAlgorithm.CreateEncryptor(), CryptoStreamMode.Write);
            byte[] DataToEncrypt = Encoding.UTF8.GetBytes(value);

            try
            {
                encStream.Write(DataToEncrypt, 0, DataToEncrypt.Length);
                encStream.FlushFinalBlock();

                byte[] encryptedBytes = new byte[Convert.ToInt32(MemoryStream.Length - 1) + 1];
                MemoryStream.Position = 0;
                MemoryStream.Read(encryptedBytes, 0, Convert.ToInt32(MemoryStream.Length));

                return Convert.ToBase64String(encryptedBytes);
            }
            finally
            {
                encStream.Close();
                TDESAlgorithm.Dispose();
                Password.Dispose();
            }
        }

        public static string DecryptPassword(string value, string key)
        {
            TripleDESCryptoServiceProvider tdesAlgorithm = new TripleDESCryptoServiceProvider
            {
                IV = new byte[8]
            };

            PasswordDeriveBytes password = new PasswordDeriveBytes(key, new byte[] { });
            tdesAlgorithm.Key = password.CryptDeriveKey("TripleDES", "MD5", 168, new byte[8]);

            byte[] encryptedBytes = Convert.FromBase64String(value);
            MemoryStream memoryStream = new MemoryStream(value.Length);
            CryptoStream decStream = new CryptoStream(memoryStream, tdesAlgorithm.CreateDecryptor(), CryptoStreamMode.Write);

            try
            {
                decStream.Write(encryptedBytes, 0, encryptedBytes.Length);
                decStream.FlushFinalBlock();

                byte[] plainBytes = new byte[Convert.ToInt32(memoryStream.Length - 1) + 1];
                memoryStream.Position = 0;
                memoryStream.Read(plainBytes, 0, Convert.ToInt32(memoryStream.Length));

                return Encoding.UTF8.GetString(plainBytes);
            }
            finally
            {
                decStream.Close();
                tdesAlgorithm.Dispose();
                password.Dispose();
            }
        }
    }
}