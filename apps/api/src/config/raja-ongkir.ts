// import axios from "axios";
// const RAJA_ONGKIR_API_KEY = process.env.RAJA_ONGKIR_API_KEY;
// const RAJA_ONGKIR_BASE_URL = "https://api.rajaongkir.com/starter";

// export async function getProvinceName(provinceId: string): Promise<string> {
//   const res = await axios.get(`${RAJA_ONGKIR_BASE_URL}/province`, {
//     headers: { key: RAJA_ONGKIR_API_KEY },
//   });
//   const province = res.data.rajaongkir.results.find(
//     (prov: any) => prov.province_id === provinceId
//   );
//   return province?.province || "";
// }

// export async function getCityName(cityId: string): Promise<string> {
//   const res = await axios.get(`${RAJA_ONGKIR_BASE_URL}/city`, {
//     headers: { key: RAJA_ONGKIR_API_KEY },
//   });
//   const city = res.data.rajaongkir.results.find(
//     (city: any) => city.city_id === cityId
//   );
//   return city?.city_name || "";
// }
