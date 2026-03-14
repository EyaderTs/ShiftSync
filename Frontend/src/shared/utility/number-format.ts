export function numberFormat (number:number,maximumSignificantDigits?:number){
   return  new Intl.NumberFormat('en-IN', { maximumSignificantDigits: maximumSignificantDigits??3 }).format(
        number,
      )
}