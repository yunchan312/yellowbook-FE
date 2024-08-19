import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/16/solid";
import ReactCalendar from "../../components/calendar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUpComing } from "../../util/Schedule";
import { useRecoilState } from "recoil";
import { upcomingSchedule } from "../../atom";
import axios from "axios";

export default function DesktopHome() {
  const navigate = useNavigate("");
  const [upcoming, setUpComing] = useState({});
  const [team, setTeam] = useState([]);
  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
    }

    axios
      .get(`${process.env.REACT_APP_BASE_URL}/api/v1/members/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((res) => setTeam(res.data.data.teams))
      .catch((e) => console.log(e));

    axios
      .get(
        `${process.env.REACT_APP_BASE_URL}/api/v1/schedule/upcoming`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
        { withCredentials: true }
      )
      .then((res) => {
        console.log(res.data.data);
        setUpComing(res.data.data);
      })
      .catch((e) => console.log("upcoming err", e));
  }, []);
  return (
    <div className="flex flex-col gap-3">
      <div className="homeCard bg-opacity-15">
        <div>
          <div>
            {team.length > 0 ? team[0].teamName : "팀 정보가 없습니다."}
          </div>
          <div className="text-orange text-[12px]">
            {team.length > 0 ? `${team[0].role} 역할` : "팀 정보가 없습니다."}
          </div>
        </div>
        <div className="text-orange">
          <ChevronUpIcon className="text-xl size-7" />
          <ChevronDownIcon className="text-xl size-7" />
        </div>
      </div>

      <div
        className="homeCard bg-opacity-50"
        onClick={() => navigate("/manage-inventory")}
      >
        <div>
          <div className="font-extrabold text-lg">
            관리자가 게시한 재고 현황
          </div>
          <div className="font-thin text-[13px]">
            2024년 05월 09일 재고 현황
          </div>
        </div>
        <div className="text-orange text-[10px] h-full flex flex-col justify-end">
          더보기
        </div>
      </div>

      <div className="homeCard" onClick={() => navigate("/calendar")}>
        <div className="w-full">
          <div className="text-lg font-bold">{upcoming.scheduleTitle}</div>
          <div className="text-[15px] flex justify-start gap-3 ">
            {/* <span>5월 20일</span>
            <span>|</span>
            <span>제품B 20개에 관한 게시글</span> */}
          </div>
        </div>
      </div>

      <ReactCalendar />
    </div>
  );
}
