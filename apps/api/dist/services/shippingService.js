import axios from "axios";
export async function calculateShippingCost(originId, destinationId, weight, courier) {
    const response = await axios.post("https://api.rajaongkir.com/starter/cost", {
        origin: originId,
        destination: destinationId,
        weight,
        courier,
    }, {
        headers: {
            key: process.env.RAJA_ONGKIR_API_KEY,
            "Content-Type": "application/json",
        },
    });
    // Return the list of available services
    return response.data.rajaongkir.results[0].costs;
}
export async function getProvinces() {
    const response = await axios.get("https://api.rajaongkir.com/starter/province", {
        headers: {
            key: process.env.RAJA_ONGKIR_API_KEY,
        },
    });
    return response.data.rajaongkir.provinces;
}
export async function getCityByProvince(provinceId) {
    const response = await axios.get(`https://api.rajaongkir.com/starter/city?province=${provinceId}`, {
        headers: {
            key: process.env.RAJA_ONGKIR_API_KEY,
        },
    });
    return response.data.rajaongkir.cities;
}
export async function getCityById(cityId) {
    const response = await axios.get(`https://api.rajaongkir.com/starter/city?id=${cityId}`, {
        headers: {
            key: process.env.RAJA_ONGKIR_API_KEY,
        },
    });
    return response.data.rajaongkir.results[0];
}
export async function getAllCities() {
    const response = await axios.get("https://api.rajaongkir.com/starter/city", {
        headers: {
            key: process.env.RAJA_ONGKIR_API_KEY,
        },
    });
    return response.data.rajaongkir.cities;
}
