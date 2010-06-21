require 'shogi'
require 'test/unit'
require 'rack/test'

LOGGER = Logger.new("log/test_cc_getData.log")

class CacheTestTest < Test::Unit::TestCase

  def test_get_msg
    param = { 'bid'=> 1,'uid'=>1,'level'=> 3,'mask'=> 7,'range'=> 'full' }
    ct = CacheTest.new(param, LOGGER)
    ct.determine_bid_range
    res = ct.get_msg
    unpacked = MessagePack.unpack res
    LOGGER.debug(result_print(unpacked))
    assert unpacked.size > 0
    assert unpacked['board'][0]['bid'] == unpacked['prevMoves'][0]['nxt_bid']
  end

  # get_msgの結果のログ表示を整形する
  def result_print(data)
    ret = ''
    data.each do |key, value|
      ret += "\n" + key
      ret += "::\n"
      ret += (value ? value.map{|e| e.inspect }.join("\n") : 'nil')
    end
    ret
  end

  def delete_board(b)
    query = "delete from boards where board = '#{b['board']}' \
                                  and white = '#{b['white']}'\
                                  and black = '#{b['black']}'\
                                  and turn  = '#{b['turn']}'"
    DB[query].all
  end

  def delete_move(m)
    query = "delete from moves where bid = #{m['bid']} and \
             m_from = #{m['from']} and m_to = #{m['to']} and \
             piece = '#{m['piece']}' and promote = '#{m['promote']}'"
    DB[query].all
  end

end  # of class DbAccessorTest
