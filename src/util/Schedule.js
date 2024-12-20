import axios from "axios";

export async function getUpComing(act, setUpComing) {
  const res = await axios
    .get(
      `${process.env.REACT_APP_BASE_URL}/api/v1/schedule/upcoming`,
      {
        headers: { Authorization: `Bearer ${act}` },
      },
      { withCredentials: true }
    )
    .then((res) => {
      console.log(res.data.data);
      return res.data.data;
    })
    .catch((e) => console.log("upcoming err", e));
  setUpComing(res);
}

export async function getMonth(act) {
  const res = await axios
    .get(
      `${process.env.REACT_APP_BASE_URL}/api/v1/schedule/monthly`,
      {
        headers: { Authorization: `Bearer ${act}` },
      },
      { withCredentials: true }
    )
    .then((res) => {
      console.log(res.data.data);
      return res.data;
    })
    .catch((e) => console.log("getMonth Err", e));
  return res;
}

export async function getDaily(act, year, month, day) {
  const res = await axios
    .get(
      `${process.env.REACT_APP_BASE_URL}/api/v1/schedule/daily?year=${year}&motnth=${month}&day=${day}`,
      {
        headers: { Authorization: `Bearer ${act}` },
      },
      { withCredentials: true }
    )
    .then((res) => {
      console.log(res.data);
      return res.data.data.schedules;
    })
    .catch((e) => console.log("getDaily Err", e));
  return res;
}
