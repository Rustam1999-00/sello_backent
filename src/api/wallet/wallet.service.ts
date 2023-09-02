import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/infra/entities/user.entity';
import { UserRepo } from 'src/infra/repositories/user.repo';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import stripe from 'stripe';
import { PayDto } from './dto/pay.dto';
import { Request } from 'express';


interface forUser extends Request {
  verify?: {
    user_id: number;
  };
}

const stripeService = new stripe(
  'pk_test_51NXdZwJ9minxYKloUPlKAeMM3uMj9LTl0Ebf9UtqPzVlGQlg404podsURwfl6hMzepNZeZXpLMi2A8490nWrMKxS00yLCLZ6Go',
  { apiVersion: '2023-08-16' },
);

@Injectable()
export class WalletService {
  constructor(@InjectRepository(User) private readonly userRepo: UserRepo) {}

  async create(createWalletDto: CreateWalletDto, req: forUser) {
    try {
      const { amount, payment_id, user_id } = createWalletDto;

      const paymentIntent = await stripeService.paymentIntents.create({
        amount,
        currency: 'usd',
        confirm: true,
        payment_method: payment_id,
        return_url: 'http://localhost:3000/api/wallet',
      });

      const user = await this.userRepo.findOne({ where: { id: user_id } });
      const newBalance = user.balance + amount;

      await this.userRepo.update({ id: user_id }, { balance: newBalance });

      return { message: 'Success' };
    } catch (error) {
      return { message: error.message };
    }
  }

  async pay(paymentDto: PayDto, req: forUser) {
    const { user_id } = req.verify;
    const { amount } = paymentDto;
    const user = await this.userRepo.findOne({ where: { id: user_id } });

    if (!user) return { message: 'User not found!' };

    if (user.balance < amount)
      return {
        message: `You don't have enough funds in your wallet. Please fill your wallet. Your balance: ${user.balance}`,
      };

    const newBalance = user.balance - amount;
    await this.userRepo.update({ id: user_id }, { balance: newBalance });
    return { message: 'The payment was made successfully' };
  }
}