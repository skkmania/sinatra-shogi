# -*- coding: utf-8 -*-
# vim: set fileencoding=utf-8 :
#
#  store_spec.rb
#
#require 'lib/store.rb'
require 'pseudo_wave.rb'

SpecLog = Logger.new('log/store_spec.log')
describe Store, 'は初期化したとき' do
  before do
    @store = Store.new(SpecLog)
  end

  it "DbAccessor をプロパティとして持つ" do
    @store.dba.should_not be_nil
  end

  it "current_bid が1である" do
    @store.current_bid.should == 1
  end
end

describe Store, "は#fromState state を実行したとき" do
  before do
    @store = Store.new(SpecLog)
    @state = Wave::State.new
  end
  it "サイズがひとつ大きくなる" do
    lambda {
      @store.fromState @state
    }.should change(@store, :size).by(1)
  end
end

describe Store, "は#update_store を実行したとき" do
  before do
    @store = Store.new(SpecLog)
    @store.update_store
  end
  it "board, nextMoves, prevMoves 各キーの値を持つ" do
    @store['board'].size.should >= 1
    @store['nextMoves'].size.should >= 1
    @store['prevMoves'].size.should >= 1
  end
end

describe Store, "は#read_from_db を実行したとき" do
  before do
    @store = Store.new(SpecLog)
    @dummy = {1 => {}, 2 => {}}
  end
  it "サイズが変わる" do
    lambda {
      @store.read_from_db @dummy
    }.should change(@store, :size)
  end
end

describe Store, "は#get_section を実行したとき" do
  before do
    @store = Store.new(SpecLog)
    @store.update_store
    @result = @store.get_section @store.current_bid
  end
  it "返り値resultはbid,board,next,prev 各キーの値を持つ" do
    @result['bid'].size.should >= 1
    @result['board'].size.should >= 1
    @result['next'].size.should >= 1
    @result['prev'].size.should >= 1
  end
end
