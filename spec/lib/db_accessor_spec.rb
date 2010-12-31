# -*- coding: utf-8 -*-
# vim: set fileencoding=utf-8 :
#
#  db_accessor_spec.rb
#
#require 'lib/db_accessor.rb'
require 'pseudo_wave.rb'

# test用パラメータ
SpecParam = {
  'bid'   => 1,
  'uid'   => 1,
  'mask'  => 7,
  'level' => 3,
  'range' => 'full' }

# test用Logger
SpecLog = Logger.new('log/db_accessor_spec.log')

# test用utility
  def delete_board(b)
    query = "delete from boards where board = '#{b['board']}' \
             and white = '#{b['white']}' and black = '#{b['black']}' and turn = '#{b['turn']}'"
    DB[query].all
  end

  def delete_move(m)
    query = "delete from moves where bid = #{m['bid']} and \
             m_from = #{m['from']} and m_to = #{m['to']} and \
             piece = '#{m['piece']}' and promote = '#{m['promote']}'"
    DB[query].all
  end

# 各Spec
describe DbAccessor, 'は初期化したとき' do
  before(:all) do
    @db_accessor = DbAccessor.new(SpecParam, SpecLog)
  end

  it "masked_data_name をプロパティとして持つ" do
    @db_accessor.masked_data_name.should_not be_nil
  end

  it "SpecParamのmask = 7なのでmasked_data_nameは、[board, nextMoves, prevMoves]である" do
    @db_accessor.masked_data_name.should == ['board','nextMoves','prevMoves']
  end
end
