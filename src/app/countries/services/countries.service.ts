import { Injectable } from '@angular/core';
import { Country, Region, SmallCountry } from '../interfaces/country.interfaces';
import { Observable, combineLatest, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private baseUrl: string = 'https://restcountries.com/v3.1';

  private _regions: Region[] = [Region.Africa, Region.Americas, Region.Asia, Region.Europe, Region.Oceania]

  constructor(
    private http: HttpClient
  ) { }

  get regions(): Region[] {
    return [...this._regions ];
  }

  getCountriesByRegion( region: Region ): Observable<SmallCountry[]> {

    if (!region) return of ([]);

    const url: string = `${ this.baseUrl }/region/${ region }?fields=cca3,name,borders,population`;

    return this.http.get<Country[]>(url)
      .pipe(
        //Con el operador map de rxjs transformamos la data, luego usamos el operador map de los arrays para transformar la data de countries a un SmallCountry
        map( countries => countries.map( country => ({ 
           name: country.name.common,
           cca3: country.cca3,
           borders: country.borders ?? [],
           population: country.population
        }))),
      )
  }

  getCountryByAlphaCode( alphaCode: string): Observable<SmallCountry>{
    const url = `${ this.baseUrl }/alpha/${ alphaCode }?fields=cca3,name,borders,population`;
    return this.http.get<Country>( url )
      .pipe(
        map ( country => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? [],
          population: country.population
        }))
      )
  }

  getCountryBordersByCodes( borders: string[] ):Observable<SmallCountry[]> {
    if (!borders || borders.length === 0) return of([]);
    //creamos un array que nos va a servir para almacenar todos los observables
    const countriesRequests: Observable<SmallCountry>[] = [];
    
    //barremos cada uno de esos borders que tenemos en nuestro arreglo con el forEach
    borders.forEach( code => {
      //este request tiene la informacion para un pais en particular, ojo aun no hacemos el subscribe por lo tanto no se va a disparar
      const request = this.getCountryByAlphaCode( code );
      //insertamos la request en el listado de obsevable de paises
      countriesRequests.push( request );
    });

    //se utiliza para combinar los últimos valores emitidos por varios observables en un solo observable,
    // y emitir un nuevo valor cada vez que cualquiera de los observables originales emita un valor nuevo.
    return combineLatest( countriesRequests )
  }
}
