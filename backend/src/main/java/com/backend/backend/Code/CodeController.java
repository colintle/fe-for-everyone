package com.backend.backend.Code;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/code")
public class CodeController {

    @PostMapping("/execute")
    public ResponseEntity<?> executeCode(@RequestBody CodeRequest codeRequest) {
        // Validate input
        if (codeRequest.getCode() == null || codeRequest.getCode().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Code cannot be empty");
        }

        // Prepare the data for the code execution API
        Map<String, Object> data = new HashMap<>();
        data.put("language", "c");
        data.put("version", "10.2.0");

        Map<String, String> file = new HashMap<>();
        file.put("name", "main");
        file.put("content", codeRequest.getCode());

        data.put("files", new Map[]{file});

        // Send the request to the external API that runs the code
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://emkc.org/api/v2/piston/execute"; // The API endpoint

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, data, Map.class);
            Map<String, Object> responseBody = response.getBody();

            if (responseBody != null && responseBody.containsKey("run")) {
                Map<String, Object> runResult = (Map<String, Object>) responseBody.get("run");

                String stdout = (String) runResult.get("stdout");
                String stderr = (String) runResult.get("stderr");
                String signal = (String) runResult.get("signal");

                // Check if the signal is SIGKILL
                if ("SIGKILL".equals(signal)) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while executing the code");
                }

                // Return stderr if there is any error output, otherwise return stdout
                if (stderr != null && !stderr.isEmpty()) {
                    return ResponseEntity.ok(stderr);
                } else if (stdout != null && !stdout.isEmpty()) {
                    return ResponseEntity.ok(stdout);
                } else {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while executing the code");
                }
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while executing the code");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while executing the code");
        }
    }
}
