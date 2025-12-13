ARG PYTHON_VERSION=3.13

FROM python:${PYTHON_VERSION}-slim as base
RUN pip install --no-cache-dir uv
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --locked

ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser
    
RUN mkdir -p /app/logs && chown appuser:appuser /app/logs

USER appuser

ENV UV_CACHE_DIR=/tmp/.cache/uv

COPY . . 

EXPOSE 8000

CMD ["sh", "-c", "uv run uvicorn api:app --host 0.0.0.0 --port ${PORT:-8000}"]



