import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PitchesController } from './controllers/pitches.controller';
import { PitchesService } from './services/pitches.service';
import { Pitch } from './entities/pitch.entity';
import { User } from './entities/user.entity';
import { Org } from './entities/org.entity';
import { Membership } from './entities/membership.entity';
import { PitchFile } from './entities/pitch-file.entity';
import { KPI } from './entities/kpi.entity';
import { Valuation } from './entities/valuation.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'ai_startup_fund',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([
      Pitch,
      User,
      Org,
      Membership,
      PitchFile,
      KPI,
      Valuation,
    ]),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
  ],
  controllers: [AppController, PitchesController],
  providers: [AppService, PitchesService],
})
export class AppModule {}
