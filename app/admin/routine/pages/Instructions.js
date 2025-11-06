import { Button } from "@mui/material";

export default function Instructions({ setPage }) {
  return (
    <>
      <Button
        onClick={() => {
          navigator.clipboard.writeText("");
          sessionStorage.removeItem("success");
          sessionStorage.removeItem("warning");
          sessionStorage.removeItem("error");
          setPage(2);
        }}
        variant="contained"
        fullWidth
      >
        루틴 시작
      </Button>
    </>
  );
}
