import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { Global, Module } from '@nestjs/common';
import { mailsConfig } from './config/mail.config';

@Global()
@Module({
  imports: [MailerModule.forRootAsync(mailsConfig)],
  providers: [MailService],
  exports: [MailService],
})
export class MailsModule {}
