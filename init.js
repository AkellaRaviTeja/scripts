console.log("Initializing Apxor");
window.Apxor?.init(
      "b0bf1fc7-b104-4e92-9cc5-590fcb685c29",
      {
        debug: true,
        idle_time_out: 600,
        plugins: ["ApxorRTM"],
        version: 144,
        events_upload_time: 5,
        retry_time: 5,
        bulk_upload: true,
        ed_t_time: 90,
        level: "debug",
      },
      function success(data) {
        console.log("SDK Initialized: " + data.client_id);
      },
      function error() {
        console.log("SDK is not initialized.");
      }
    );
