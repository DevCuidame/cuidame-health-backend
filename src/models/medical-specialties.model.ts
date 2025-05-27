    // src/models/appointment-type.model.ts
    import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
    
    @Entity('medical_specialties')
    export class MedicalSpecialties {
      @PrimaryGeneratedColumn('increment')
      id!: number;
    
      @Column()
      name!: string;
    
      @CreateDateColumn()
      created_at!: Date;
    
      @UpdateDateColumn()
      updated_at!: Date;
    
    }