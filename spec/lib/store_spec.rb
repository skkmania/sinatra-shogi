# -*- coding: utf-8 -*-
# vim: set fileencoding=utf-8 :
#
#  store_spec.rb
#
require 'lib/store.rb'
require 'pseudo_wave.rb'

describe Store, 'は初期化したとき' do
  before do
    @store = Store.new
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
    @store = Store.new
    @state = Wave::State.new
  end
  it "サイズがひとつ大きくなる" do
    lambda {
      @store.fromState @state
    }.should change(@store, :size).by(1)
  end
end

describe Store, "は#update を実行したとき" do
  before do
    @store = Store.new
  end
  it "サイズが変わる" do
    lambda {
      @store.update
    }.should change(@store, :size)
  end
end
