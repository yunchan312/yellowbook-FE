import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ExitTeam = () => {
  const [selectedTeam, setSelectedTeam] = useState("");
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken");

  const handleSelectChange = (e) => {
    setSelectedTeam(e.target.value);
  };

  useEffect(() => {
    getProfile();
  });

  const getProfile = async () => {
    try {
      const getProfile_res = await axios.get(
        "https://api.yellobook.site/api/v1/members/profile",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // 프로필 상태 업데이트
      setProfile(getProfile_res.data.data);
    } catch (error) {
      console.error("프로필 불러오기 중 오류 발생", error);
    }
  };

  const doExit = async () => {
    try {
      const response = await axios.delete(
        `https://api.yellobook.site/api/v1/teams/${selectedTeam}/leave`
      );
      if (response.status === 200) {
        alert("협업 팀에서 성공적으로 나가졌습니다.");
        navigate("/mypage");
      }
    } catch (error) {
      console.error("팀 나가기 요청 중 오류 발생:", error);
      alert("팀 나가기 요청 중 오류가 발생했습니다. 다시 시도해 주세요.");
    }
  };

  return (
    <div>
      <div
        style={{ color: "#FFAB08" }}
        className="inline-block mt-20 text-xl border-b"
      >
        협업 팀 나가기
      </div>
      <div className="mt-8">
        <label className="block mb-2 text-lg" style={{ color: "#FFAB08" }}>
          삭제하실 협업 팀 스페이스를 선택해 주세요
        </label>
        <select
          className="block w-full border border-yellow bg-white text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:border-yellow-500"
          value={selectedTeam}
          onChange={handleSelectChange}
        >
          <option value="" disabled style={{ color: "#d1d5db" }}>
            팀 이름 선택
          </option>
          {profile &&
            profile.teams &&
            profile.teams.map((team, index) => (
              <option key={index} value={team.teamName}>
                {team.teamName}
              </option>
            ))}
        </select>
        <div className="flex flex-col justify-center items-center mt-48">
          <div className="text-xs mb-2" style={{ color: "#97A5A4" }}>
            팀 나가기 버튼을 누르면 스페이스에서 퇴장하게 됩니다.
          </div>
          <button
            className="w-full rounded py-2"
            style={{ backgroundColor: "#FFDE33" }}
            onClick={doExit}
          >
            팀 나가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitTeam;
