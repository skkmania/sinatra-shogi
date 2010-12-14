require 'gpsclient.rb'

describe GpsClient, "は初期化されたとき" do
  before do
    @gpsclient = GpsClient.new
  end

  it "のstatus はnilである" do
    @gpsclient.status.should be_nil
  end
  it "のstore プロパティをもつ" do
    @gpsclient.store.should_not be_nil
  end
end

describe GpsClient, "は#sendしたとき" do
  before do
    @gpsclient = GpsClient.new
    @gpsclient.send('+7776FU')
  end
  it "のstatus はsentである" do
    @gpsclient.status.should == 'sent'
  end
end
