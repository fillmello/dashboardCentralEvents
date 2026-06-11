import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from 'src/common/entities/address.entity';
import { CreateAddressDto } from 'src/common/dtos/address/create.dto';
import { UpdateAddressDto } from 'src/common/dtos/address/update.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
  ) {}

  async create(userId: number, dto: CreateAddressDto) {
    const address = this.addressRepository.create({
      ...dto,
      user: { id: userId },
    });
    return this.addressRepository.save(address);
  }

  async getAll(userId: number): Promise<Address[]> {
    return this.addressRepository.find({
      where: { user: { id: userId } },
    });
  }

  async getOne(userId: number, addressId: number): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, user: { id: userId } },
    });
    if (!address) throw new NotFoundException('Endereço não encontrado');
    return address;
  }

  async update(userId: number, addressId: number, dto: UpdateAddressDto) {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, user: { id: userId } },
    });

    if (!address) throw new NotFoundException('Endereço não encontrado');

    Object.assign(address, dto);

    return this.addressRepository.save(address);
  }

  async remove(userId: number, addressId: number) {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, user: { id: userId } },
    });

    if (!address) throw new NotFoundException('Endereço não encontrado');

    await this.addressRepository.remove(address);
  }
}
