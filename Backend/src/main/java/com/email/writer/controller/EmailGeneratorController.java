package com.email.writer.Controller;

import com.email.writer.Entity.EmailRequest;
import com.email.writer.Entity.ModifyEmailRequest;
import com.email.writer.Service.EmailGeneratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins = "*")
//@AllArgsConstructor
public class EmailGeneratorController {

    @Autowired
    public EmailGeneratorService emailGeneratorService;

    @PostMapping("/generate")
    public ResponseEntity<String> generateEmail(@RequestBody EmailRequest emailRequest){
        String response = emailGeneratorService.generateEmailReply(emailRequest);
//        String response = "Working!";
        return ResponseEntity.ok(response);
    }

    @PostMapping("/modify-generated-reply")
    public ResponseEntity<String> modifyReply(@RequestBody ModifyEmailRequest modifyEmailRequest){
        String response = emailGeneratorService.modifyReply(modifyEmailRequest);
//        String response = "Working!";
        return ResponseEntity.ok(response);
    }
}
