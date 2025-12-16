import API from "@/config/API";

const AUTO_COMPLETE = async (value: string) => {
  return new Promise((resolve, reject) => {
    const postUrl = `${API.BASE_URL}${API.AUTO_COMPLETE}?query=${value}`;
    try {
      if (value) {
        fetch(postUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((result) => {
            resolve(result?.data);
          })
          .catch((error) => reject(error));
      }
    } catch (err) {
      reject(err);
    }
  });
};

const GET_PLACE = async (option: { value: string; key: string }) => {
  return new Promise((resolve, reject) => {
    try {
      const url =
        API.BASE_URL + API.GOOGLE_PLACEPICKER + `?place_id=${option.key}`;
      fetch(url, {
        method: "get",
        headers: {
          Accept: "application/json",
        },
      })
        .then(async (response) => {
          return response.json();
        })
        .then((result) => {
          resolve(result?.data);
        })
        .catch((err) => {
          console.log("then catch", err);
          console.log(err);
          resolve({});
        });
    } catch (err) {
      console.log("try catch", err);
      console.log(err);
      resolve({});
    }
  });
};

const GET_GEOCODE = async (lat: number, long: number) => {
  return new Promise((resolve, reject) => {
    try {
      const url =
        API.BASE_URL +
        API.GOOGLE_PLACEPICKER +
        `?latitude=${lat}&longitude=${long}`;
      fetch(url, {
        method: "get",
        headers: {
          Accept: "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .catch((err) => {
          console.log(err);
          resolve({});
        })
        .then((response) => {
          resolve(response?.data);
        })
        .catch((err) => {
          console.log(err);
          resolve({});
        });
    } catch (err) {
      console.log(err);
      resolve({});
    }
  });
};

export { AUTO_COMPLETE, GET_PLACE, GET_GEOCODE };
