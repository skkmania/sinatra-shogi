class FakeSocketClient < EventMachine::Connection

  attr_writer :onopen, :onclose, :onmessage
  attr_reader :data

  def initialize
    @state = :new
    @data = []
  end

  def receive_data(data)
    @data << data
    if @state == :new
      @onopen.call if @onopen
      @state = :open
    else
      @onmessage.call(data) if @onmessage
    end
  end

  def unbind
    @onclose.call if @onclose
  end
end
