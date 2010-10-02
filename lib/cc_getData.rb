# -*- coding: utf-8 -*-
# vi: ts=2 sw=2 sts=0 nu ai ambw=double fo=tcq
#
#  cc_getData.rhtml
#
#  入力: bid, uid, mask, level, range
#        mask : どのデータを取得するかを示す２進数の10進表現
#        level: bidから始まって収集するデータの深さ
#        range: full, onlyの二値のうちどちらか。fullは 1..levelの全階層のデータを収集。onlyはlevelのみ。

class CacheTest
  def initialize(param, logger)
    @logger = logger
    @logger.debug { param.to_s }
    @logger.debug { param['bid'] }
    @params = param
    @bid = @params['bid']
    @name = @params['name']
    @uid = @params['uid']
    @mask = @params['mask'].to_i
    @level = @params['level']
    @range = @params['range']
    @data_name = %w|board nextMoves prevMoves movePointsByUser movePointsAverage moveComments boardPointByUser boardPointAverage boardComments|
    @masked_data_name = []
    @data_name.each_with_index{|e,i| @masked_data_name.push e if @mask[i] == 1 }

    @bids = []
    @res = ''
    @gotten = {}
  end

  def queries
    bids_expr = @bids.join(',').gsub('bid','')
    { 
      "board" => "select * from boards where bid in ( #{bids_expr} );",
      "nextMoves" => "select * from moves where bid in ( #{bids_expr} ) order by mid;",
      "prevMoves" => "select * from moves where nxt_bid in ( #{bids_expr} );",
      "movePointsByUser" => "select bid, mid, point as personal from move_point_user
				 where bid in ( #{bids_expr} ) and userid = #{@uid} order by bid,mid;",
      "movePointsAverage" => "select bid, mid, point as total from move_points
				 where bid in ( #{bids_expr} ) order by bid,mid;",
      "moveComments" => "select bid,mid,mcomment,userid,uname from move_comments natural inner join users where bid in ( #{bids_expr} ) order by mid;",
      "boardPointByUser" => "select bid, coalesce(sum(pbpoint), 0) as pbpoint from boardp_users where bid in ( #{bids_expr} ) and userid = #{@uid} group by bid;",
      "boardPointAverage" => "select bid, coalesce(sum(bpoint), 0) as bpoint from board_points where bid in ( #{bids_expr} ) group by bid;",
      "boardComments" => "select bid, bcomment,userid,uname from board_comments natural inner join users where bid in ( #{bids_expr} ) order by userid;"
    }
  end

  def determine_bid_range
    @logger.debug { "into determine_bid_range" } 
    case @range
      when 'full'
        query = "select bid, nxts, pres from cc_getBids(#{@bid}, #{@level});"
      when 'only'
        query = "select bid, nxts, pres from cc_getBids(#{@bid}, #{@level}) where ll = #{@level};"
    end

    @logger.debug { "query : #{query}" } 
    begin
      kekka = DB[query]
      @logger.debug { 'kekka : ' + kekka.inspect } 
      @bids = kekka.map(:bid)
      @logger.debug { 'bid_range : ' + @bids.join(',') } 
    rescue => error
      @logger.error { "cc_getData : error !" + error.message } 
      print 'error'
    ensure
      #kekka.clear if kekka
    end
  end
=begin
 [{"pres":"{}", "bid":"1", "nxts":"{4,798,1024,1388,26624,49916,66984,92020,94600,94602,94604,94606,94608}"}, {"pres":"{1}", "bid":"4", "nxts":"{3,113,21195,

 {:nxts=>"{3,235}", :pres=>"{1}", :bid=>2}   
=end
  def get_data
    kekka = nil
    begin
     # @gottenというhashに、data nameをキーとして、
     # そのquery結果をvalueとして格納していく
      @masked_data_name.each{|name|
        @logger.debug { "name : #{name}" } 
        @logger.debug { "query : #{queries[name]}" } 
        kekka = DB[queries[name]]
        # @logger.debug { "kekka.inspect : #{kekka.inspect}" } 
        @gotten[name] = []
        kekka.each do |row|
          @logger.debug { row.inspect.to_s }
          modified_row = row.inspect.gsub(/:(\w+)/){ '"' + $1 + '"' }.gsub('=>',':').gsub('"{','[').gsub('}"',']')
          #modified_row = row.inspect.gsub('"{','[').gsub('}"',']').gsub(/:(\w+)/){ '"' + $1 + '"' }.gsub('=>',':').gsub('"{','{')
          @gotten[name].push modified_row
          #rowJsonObj = row.inspect.to_json
          #@gotten[name].push rowJsonObj

        end
        #  これではまずい。nameとカラム名が一致してるほうがすくない
        @logger.debug { "gotten[#{name}] : #{@gotten[name].join(',')}" } 
      }
    rescue => error
      @res = { 'error' => -1 }
    ensure
      #kekka.clear if kekka
    end
    return @gotten
  end

  # @gottenの出力を読みやすく整形する
  def log_format(obj)
    ret = "board :\n"
    # obj は hash
      # obj['board'] は array. その要素はhash
    ret += obj['board'].map{|bh| bh.to_a_with_order([:bid,:turn,:board,:black,:white]).join(',') }.join("\n")

    ret += "\nnextMoves :\n"
    nmgrp = obj['nextMoves'].group_by{|m| m[:bid] }.sort
    nmgrp.each{|bid, moves|
      ret += moves.map{|bh| bh.to_a_with_order([:bid,:mid,:m_from,:m_to,:piece,:promote,:nxt_bid]).join(',') }.join("::")
      ret += "\n"
    }

    ret += "\nprevMoves :\n"
    nmgrp = obj['prevMoves'].group_by{|m| m[:bid] }.sort
    nmgrp.each{|bid, moves|
      ret += moves.map{|bh| bh.to_a_with_order([:bid,:mid,:m_from,:m_to,:piece,:promote,:nxt_bid]).join(',') }.join("::")
      ret += "\n"
    }
      ret
  end

  def get_msg
    @gotten = @masked_data_name.inject({}){|res_hash, name|
      result = DB[queries[name]].all
      @logger.debug { "queries[#{name}] : #{queries[name]}" } 
      # @logger.debug { "#{name} : #{result.inspect}" } 
      res_hash[name] = result
      res_hash
    }
    @logger.debug { "gotten : #{log_format(@gotten)}" } 
    return @gotten.to_msgpack
  end

  def get_bids
    result = DB[queries['bids']].all
    @logger.debug { "result.inspect : #{result.inspect}" } 
    @logger.debug { "result : #{result}" } 
    @logger.debug { "result.msgpack : #{result.to_msgpack}" } 
    return result.to_msgpack
  end

  def output
=begin
    @param.out( 'type' => 'application/json', 'charset' => 'UTF-8' ){
      @gotten.inspect.gsub('=>',':')
    }
=end
    @logger.debug { "gotten : #{@gotten.inspect}" } 
    @gotten.inspect.gsub('=>',':')
  end

  def to_html
  end

=begin
ct = CacheTest.new
ct.determine_bid_range
ct.get_data
ct.output
=end
  def regist_board_move(params)
    turn    = params['turn'][0].to_s
    board   = params['board'][0]
    black   = params['black'][0]
    white   = params['white'][0]
    from    = params['from'][0]
    from    = 0 if from == 'ss'
    to      = params['to'][0]
    piece   = params['piece'][0]
    promote = params['promote'][0]
    oldbid  = params['oldbid'][0]

    query = "select get_bid('#{turn}'::bool,'#{board}'::char(81),\
      '#{black}'::varchar(38),'#{white}'::varchar(38),\
       #{oldbid}::integer, #{from}::smallint, #{to}::smallint,\
      '#{piece}'::char, '#{promote}'::bool);"
    @logger.debug { "#{query}" }
    result = DB[query].all
    @logger.debug { "result.inspect : #{result.inspect}" } 
    @logger.debug { "result : #{result}" } 
    if existed(result)
      
    else
    end
    @logger.debug { "result.msgpack : #{result.to_msgpack}" } 
    return result.to_msgpack
  end
end
