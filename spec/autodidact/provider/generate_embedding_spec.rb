# frozen_string_literal: true

require 'spec_helper'

RSpec.describe Autodidact::Provider::GenerateEmbedding do
  let(:query) { described_class.new(text: 'hello world', access_token: 'sk-test') }
  let(:openai_client) { instance_double(OpenAI::Client) }
  let(:embedding) { Array.new(1536) { rand } }

  before do
    allow(OpenAI::Client).to receive(:new).with(access_token: 'sk-test').and_return(openai_client)
  end

  describe '#call' do
    it 'returns the embedding vector on success' do
      allow(openai_client).to receive(:embeddings).with(
        parameters: { model: 'text-embedding-3-small', input: 'hello world' }
      ).and_return('data' => [{ 'embedding' => embedding }])

      result = query.call

      expect(result).to be_success
      expect(result.payload).to eq(embedding)
    end

    it 'raises ProviderError when embedding is nil' do
      allow(openai_client).to receive(:embeddings).and_return('data' => [{ 'embedding' => nil }])

      expect { query.call }.to raise_error(Autodidact::Provider::ProviderError, /Embedding response was empty/)
    end

    it 'raises ProviderError when embedding is empty' do
      allow(openai_client).to receive(:embeddings).and_return('data' => [{ 'embedding' => [] }])

      expect { query.call }.to raise_error(Autodidact::Provider::ProviderError, /Embedding response was empty/)
    end

    it 'returns a failure result on Faraday connection errors' do
      allow(openai_client).to receive(:embeddings).and_raise(Faraday::ConnectionFailed, 'connection refused')

      result = query.call

      expect(result).to be_failure
    end
  end
end
