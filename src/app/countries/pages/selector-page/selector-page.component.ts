import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country.interfaces';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [
  ]
})
export class SelectorPageComponent implements OnInit {

  public countriesByRegion: SmallCountry[] = [];
  public borders: SmallCountry[] = [];

  public myForm: FormGroup = this.fb.group({
    region: ['', Validators.required ],
    country: ['', Validators.required ],
    border: ['', Validators.required ],
  })

  constructor(
    private fb: FormBuilder,
    private countriesService: CountriesService
  ){}

  ngOnInit(): void {
    this.onRegionChanged();
    this.onCountryChanged();
  }

  get regions(): Region[] {
    return this.countriesService.regions;
  }

  onRegionChanged(): void {
    //Creamos un listener, cuando la region cambia poder disparar la peticion http con el valor de la region seleccionada
    this.myForm.get('region')!.valueChanges
    .pipe(
      //Con el operador tap disparamos un efecto, cada vez que cambie la region antes de que se dispare la peticion http le asignamos un valor '' al campo country
      tap( () => this.myForm.get('country')!.setValue('') ),
      tap( () => this.borders = [] ),
      switchMap( (region) => this.countriesService.getCountriesByRegion(region) ), //con el switchMap recibimos el valor de un observable y nos subscribimos a otro observable
    )
    .subscribe( countries => {
      this.countriesByRegion = countries.sort(); 
    });
  }

  onCountryChanged(): void {
    //Creamos un listener, cuando el country cambia poder disparar la peticion http con el valor del pais seleccionado
    this.myForm.get('country')!.valueChanges
    .pipe(
      tap( () => this.myForm.get('border')!.setValue('') ),
      //Usamos el operador filter, en el value tenemos el alphaCode le decimos que haga la peticion unicamente cuando ya exista un valor
      filter( (value:string) => value.length > 0 ),
      //este switchMap nos devuelve los borders de cada pais
      switchMap( (alphaCode) => this.countriesService.getCountryByAlphaCode(alphaCode) ),
      switchMap( (country) => this.countriesService.getCountryBordersByCodes( country.borders ))
    )
    .subscribe( countries => {
      this.borders = countries.sort();
    });
  }

}
