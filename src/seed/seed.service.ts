import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>,

    private readonly http: AxiosAdapter,
  ){}
  
  async executeSeed() {
    // It means delete * from pokemons, lo hago para que 
    //al principio borre lo que exista y no muestre errores de duplicados
    await this.pokemonModel.deleteMany({}); 

    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');
    
    // OPCIÓN 1 (más óptima) para crear simultanéamente los pokemon
    const pokemonToInsert: { name: string, no: number}[] = []
    
    data.results.forEach(async({ name, url }) => {
      const segments = url.split('/');
      const no:number = +segments[ segments.length - 2 ]

      pokemonToInsert.push({ name, no });
    });

    await this.pokemonModel.insertMany(pokemonToInsert);

    // OPCIÓN 2 para crear simultanéamente los pokemon
    // const insertPromisesArray = [];

    // data.results.forEach(async({ name, url }) => {
    //   const segments = url.split('/');
    //   const no:number = +segments[ segments.length - 2 ]

    //   // const pokemon = await this.pokemonModel.create({ name, no}) Esto me pone a esperar por cada respuesta
    //   insertPromisesArray.push(
    //     this.pokemonModel.create({ name, no})
    //   );
    // });

    // await Promise.all( insertPromisesArray )
    return 'Seed executed';
  }
}
