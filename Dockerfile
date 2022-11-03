FROM denoland/deno:latest

RUN mkdir -p /opt/vuln-showcase
WORKDIR /opt/vuln-showcase

CMD ["deno", "--unstable", "task", "start"]
