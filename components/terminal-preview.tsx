export function TerminalPreview() {
  const requests = [
    { time: "14:32:15", method: "GET", path: "/api/users", status: "202 OK" },
    { time: "14:32:08", method: "POST", path: "/api/auth/login", status: "202 OK" },
    { time: "14:31:52", method: "PUT", path: "/api/users/42", status: "202 OK" },
    { time: "14:31:45", method: "DELETE", path: "/api/posts/17", status: "202 OK" },
  ];

  return (
    <div className="w-full max-w-[840px] overflow-hidden rounded-lg border border-primary/15 bg-[#050505]/95 shadow-2xl shadow-primary/5">
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.02] px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#27ca40]" />
        </div>
        <span className="ml-2 font-mono text-xs text-muted-foreground">terminal</span>
      </div>

      <div className="overflow-x-auto p-6 text-left font-mono text-sm leading-relaxed">
        <div className="flex">
          <span className="text-muted-foreground">$</span>
          <span className="ml-2 font-semibold text-foreground">goport http 8080</span>
        </div>

        <div className="mt-5 min-w-[36rem] space-y-1">
          <div className="grid grid-cols-[10rem_minmax(24rem,1fr)]">
            <span className="text-muted-foreground">Dashboard</span>
            <span className="font-semibold text-foreground">http://127.0.0.1:4040</span>
          </div>
          <div className="grid grid-cols-[10rem_minmax(24rem,1fr)]">
            <span className="text-muted-foreground">Region</span>
            <span className="font-semibold text-foreground">Europe (eu)</span>
          </div>
          <div className="grid grid-cols-[10rem_minmax(24rem,1fr)]">
            <span className="text-muted-foreground">Status</span>
            <span>
              <span className="text-primary">online</span>
              <span className="text-muted-foreground"> (140ms)</span>
            </span>
          </div>
          <div className="grid grid-cols-[10rem_minmax(24rem,1fr)]">
            <span className="text-muted-foreground">Forwarding</span>
            <span>
              <span className="text-primary">{"https://abc123.goport.uz"}</span>
              <span className="text-muted-foreground">{" \u2192 "}</span>
              <span className="font-semibold text-foreground">{"localhost:8080"}</span>
            </span>
          </div>
        </div>

        <div className="mt-6 min-w-[36rem]">
          <div className="font-semibold text-foreground">HTTP Requests</div>
          <div className="text-muted-foreground/80">-------------</div>
          <div className="mt-2 space-y-1 text-xs">
            {requests.map((request) => (
              <div
                key={`${request.time}-${request.method}`}
                className="grid grid-cols-[5rem_4.5rem_10rem_4.5rem] items-center"
              >
                <span className="text-muted-foreground">{request.time}</span>
                <span className="text-muted-foreground">{request.method}</span>
                <span className="font-semibold text-foreground">{request.path}</span>
                <span className="font-semibold text-primary">{request.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
