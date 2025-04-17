package com.email.writer.Entity;

public class ModifyEmailRequest {
    private String generatedReply;
    private String modification;

    public String getGeneratedReply() {
        return generatedReply;
    }

    public void setGeneratedReply(String generatedReply) {
        this.generatedReply = generatedReply;
    }

    public String getModification() {
        return modification;
    }

    public void setModification(String modification) {
        this.modification = modification;
    }
}
