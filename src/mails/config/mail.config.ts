import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

export const mailsConfig = {
  useFactory: (configService: ConfigService) => {
    const mailConfig = {
      transport: {
        host: configService.get('MAIL_HOST'),
        port: Number(configService.get('MAIL_PORT')),
        secure: configService.get('MAIL_SECURE') === 'true',
        auth: {
          user: configService.get('MAIL_USER'),
          pass: configService.get('MAIL_PASSWORD'),
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
      defaults: {
        from: `"Soporte "${configService.get('NAME_APP')}  <${configService.get(
          'DEFAULT_REMITTER_MAIL',
        )}>`,
      },
      // preview: true,
      template: {
        dir: join(__dirname, '../templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    };
    return mailConfig;
  },
  inject: [ConfigService],
};
