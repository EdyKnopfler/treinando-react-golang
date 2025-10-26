FROM golang:1.25

WORKDIR /api
ENV PATH="/go/bin:${PATH}"

CMD ["tail", "-f", "/dev/null"]