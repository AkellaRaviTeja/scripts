Apxor.init(
      "d39d7e64-14e4-49e8-a8f8-b86a96a9f0b8",
      {
        idle_time_out: 1800,
        plugins: ["ApxorRTM"],
        version: 144,
      },
      
      function success(data) {
        console.log("APXOR SDK Initialized");
      },
      function error() {
        console.log("APXOR SDK not initialized");
      });
  
