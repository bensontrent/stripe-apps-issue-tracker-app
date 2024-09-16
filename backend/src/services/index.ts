import axios from 'axios'
import supabase from "./supabase";



export async function createNote(note: any) {
  const { agentId, customerId, message } = note;

  if (supabase) {

    const { data, error } = await supabase
      .from('Note')
      .insert([
        {
          agentId,
          customerId,
          message
        },
      ])
      .select()



    return data;
  } else {
    return null
  }
}

export async function getAllNotes() {

  const allUsers = supabase && await supabase
    .from('Notes')
    .select("*")
  return allUsers;
}

export async function getNotesByCustomerId(customerId: string) {


  const allUsers = supabase && await supabase
    .from('Notes')
    .select("*")
    .eq('customerId', customerId)

  return allUsers;
}

export async function getAllCountries() {

  const allCountries = supabase && await supabase
    .from('countries')
    .select("*")


  return allCountries;
}

export async function getAllCurrencies() {
  const allCurrencies = supabase && await supabase
    .from('currencies')
    .select("*")
  return allCurrencies;
}


export async function getStateByCountry(iso2: string) {

  const selectedStates = supabase && await supabase
    .from('states')
    .select("*")
    .eq('iso2', iso2)

  return selectedStates;
}




export async function getWarehouses(apiKey: string | string[], res: any) {

  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://api.shipengine.com/v1/warehouses',
    headers: {
      'Accept': 'application/json',
      'API-Key': apiKey
    }
  };

  axios.request(config)
    .then((response) => {
      res.json({ error: false, data: response.data });
    })
    .catch((error) => {

      res.json({ error: true, message: error });

    })
}

export async function suggestAddress(input: string, res: any) {
  const key = process.env.GOOGLE_PLACES_API
  axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&types=address&fields=formatted_address&key=${key}`)

    .then((response) => {
      res.json({ error: false, data: response.data });
    })
    .catch((error) => {

      res.json({ error: true, message: error });

    })
}

export async function getPlaceById(id: string, res: any) {
  const key = process.env.GOOGLE_PLACES_API
  axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${id}&fields=address_components&key=${key}`)
    .then((response) => {
      res.json({ error: false, data: response.data });
    })
    .catch((error) => {

      res.json({ error: true, message: error });

    })
}


