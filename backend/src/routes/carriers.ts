import axios from "axios";
import { Request, Response} from "express";

  

const getCarriers = (req: Request, res: Response)=> {
    const apiKey = req.header('x-api-key');

  
    try {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api.shipengine.com/v1/carriers',
            headers: { 
              'Accept': 'application/json', 
              'API-Key': apiKey
            }
          };
          
          axios.request(config)
          .then((response) => {
            res.send(response.data);
          })
          .catch((error) => {
            console.log(error);
            res.send({error: error});
          });
  
     
    } catch (error) {
      console.error(error);
      res.status(404).send({
        fromCache: false,
        error: error,
        data: null,
      });
    }
  }

  export default getCarriers;